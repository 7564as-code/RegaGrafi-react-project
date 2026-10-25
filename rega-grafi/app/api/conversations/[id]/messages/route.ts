// GET  /api/conversations/[id]/messages?after=<timestamp> -> messages (supports polling)
// POST /api/conversations/[id]/messages                   -> send a message
// Only the two participants can use this (an admin may read, but never write).
import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import { notifyNewMessage } from "@/lib/email/notifications";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { messagesQuerySchema, sendMessageSchema } from "@/lib/validation/conversations";
import { profileIdSchema } from "@/lib/validation/profile";

const MESSAGE_SELECT = "id, conversation_id, sender_id, body, created_at, read_at";
const MAX_MESSAGES = 100;

/** Loads the conversation if I may see it (RLS), otherwise 404. */
async function loadConversation(
  supabase: SupabaseClient,
  ctx: RouteContext<"/api/conversations/[id]/messages">
) {
  const { id } = await ctx.params;
  const parsed = profileIdSchema.safeParse(id);
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "id must be a valid UUID");

  const { data } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", parsed.data)
    .maybeSingle();
  if (!data) throw new ApiError(404, "NOT_FOUND", "Conversation not found");
  return data;
}

export async function GET(request: Request, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const conversation = await loadConversation(supabase, ctx);

    // In a URL a "+" turns into a space; put it back so "+02:00" offsets still work.
    const rawAfter = new URL(request.url).searchParams.get("after")?.replace(" ", "+");
    const { after } = messagesQuerySchema.parse({ after: rawAfter || undefined });

    let messages;
    if (after) {
      // Polling: only what is newer than the last message the client has.
      const { data, error } = await supabase
        .from("messages")
        .select(MESSAGE_SELECT)
        .eq("conversation_id", conversation.id)
        .gt("created_at", after)
        .order("created_at", { ascending: true })
        .limit(MAX_MESSAGES);
      if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load messages");
      messages = data ?? [];
    } else {
      // First load: the newest messages, shown oldest-first.
      const { data, error } = await supabase
        .from("messages")
        .select(MESSAGE_SELECT)
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGES);
      if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load messages");
      messages = (data ?? []).reverse();
    }

    // Opening the chat marks the other person's messages as read.
    if (conversation.user_a === user.id || conversation.user_b === user.id) {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", user.id)
        .is("read_at", null);
    }

    return Response.json({ data: messages });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  try {
    const user = await requireUser();
    const { body } = await parseBody(request, sendMessageSchema);
    const supabase = await createClient();
    const conversation = await loadConversation(supabase, ctx);

    // An admin can see a conversation (to moderate) but is not allowed to write in it.
    if (conversation.user_a !== user.id && conversation.user_b !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You are not part of this conversation");
    }

    const { data, error } = await supabase
      .from("messages")
      // sender_id always comes from the session, never from the request.
      .insert({ conversation_id: conversation.id, sender_id: user.id, body })
      .select(MESSAGE_SELECT)
      .single();
    if (error) throw new ApiError(500, "SEND_FAILED", "Could not send the message");

    // Email the other participant after the response is sent (rate-limited, never fails the request).
    after(() => notifyNewMessage({ conversationId: conversation.id, senderId: user.id }));

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
