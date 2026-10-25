// GET  /api/conversations -> my conversations, each with the last message and the job title (if any)
// POST /api/conversations -> start a conversation, or return the existing one
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import {
  CONVERSATION_SELECT,
  findConversation,
  toConversationResponse,
  type ConversationRow,
  type LastMessage,
} from "@/lib/api/conversations";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { createConversationSchema } from "@/lib/validation/conversations";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    // "Mine" = I am one of the two participants (true for admins too).
    const { data, error } = await supabase
      .from("conversations")
      .select(CONVERSATION_SELECT)
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load conversations");

    const rows = (data ?? []) as unknown as ConversationRow[];

    // The newest message of each conversation.
    const lastMessages = await Promise.all(
      rows.map(async (row) => {
        const { data: message } = await supabase
          .from("messages")
          .select("id, sender_id, body, created_at, read_at")
          .eq("conversation_id", row.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return message as LastMessage;
      })
    );

    const result = rows
      .map((row, i) => toConversationResponse(row, user.id, lastMessages[i]))
      // Conversations with the newest activity first.
      .sort((x, y) =>
        (y.last_message?.created_at ?? y.created_at).localeCompare(
          x.last_message?.created_at ?? x.created_at
        )
      );

    return Response.json({ data: result });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { jobId, otherUserId } = await parseBody(request, createConversationSchema);
    const supabase = await createClient();

    if (otherUserId === user.id) {
      throw new ApiError(400, "VALIDATION_ERROR", "You cannot start a conversation with yourself");
    }

    // 1. Already exists? Return it.
    const existing = await findConversation(supabase, user.id, otherUserId, jobId ?? null);
    if (existing) {
      return Response.json({ data: toConversationResponse(existing, user.id, null) });
    }

    // 2. The other user must exist.
    const { data: other } = await supabase
      .from("profiles")
      .select("id, is_designer, availability")
      .eq("id", otherUserId)
      .maybeSingle();
    if (!other) throw new ApiError(404, "NOT_FOUND", "User not found");

    if (jobId) {
      // Conversation about a job: it must be between the job owner and a designer who proposed on it.
      const { data: job } = await supabase
        .from("jobs")
        .select("id, owner_id")
        .eq("id", jobId)
        .maybeSingle();
      if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");

      let designerId: string;
      if (job.owner_id === user.id) designerId = otherUserId;
      else if (job.owner_id === otherUserId) designerId = user.id;
      else {
        throw new ApiError(403, "FORBIDDEN", "A job conversation must include the job owner");
      }

      const { data: proposal } = await supabase
        .from("proposals")
        .select("id")
        .eq("job_id", jobId)
        .eq("designer_id", designerId)
        .maybeSingle();
      if (!proposal) {
        throw new ApiError(403, "FORBIDDEN", "A conversation about a job needs a proposal on it");
      }
    } else if (!other.is_designer || other.availability !== "available") {
      // Direct message: only to designers who are available.
      throw new ApiError(403, "DESIGNER_UNAVAILABLE", "This user is not an available designer");
    }

    // 3. Create it. The pair is stored in sorted order.
    const [userA, userB] = [user.id, otherUserId].sort();
    const { data, error } = await supabase
      .from("conversations")
      .insert({ job_id: jobId ?? null, user_a: userA, user_b: userB })
      .select(CONVERSATION_SELECT)
      .single();

    if (error) {
      // 23505 = created at the same moment by the other side: return that one.
      if (error.code === "23505") {
        const again = await findConversation(supabase, user.id, otherUserId, jobId ?? null);
        if (again) return Response.json({ data: toConversationResponse(again, user.id, null) });
      }
      throw new ApiError(500, "CREATE_FAILED", "Could not start the conversation");
    }

    return Response.json(
      { data: toConversationResponse(data as unknown as ConversationRow, user.id, null) },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
