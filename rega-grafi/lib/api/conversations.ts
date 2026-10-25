// Shared bits for the conversations routes.
import type { SupabaseClient } from "@supabase/supabase-js";
import { toPublicProfile } from "@/lib/mappers/toPublicProfile";

type ProfileRow = Parameters<typeof toPublicProfile>[0];

// A conversation comes with the job title and BOTH participants' public fields (no email).
export const CONVERSATION_SELECT = `
  id, job_id, user_a, user_b, created_at,
  job:jobs!job_id(id, title),
  profile_a:profiles!user_a(id, display_name, bio, categories, availability, logo_url, portfolio_url),
  profile_b:profiles!user_b(id, display_name, bio, categories, availability, logo_url, portfolio_url)
`;

export type ConversationRow = {
  id: string;
  job_id: string | null;
  user_a: string;
  user_b: string;
  created_at: string;
  job: { id: string; title: string } | null;
  profile_a: ProfileRow | null;
  profile_b: ProfileRow | null;
};

export type LastMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
} | null;

/** Shapes a conversation for the person asking: "the other user" is the one who is not me. */
export function toConversationResponse(row: ConversationRow, myId: string, lastMessage: LastMessage) {
  const other = row.user_a === myId ? row.profile_b : row.profile_a;
  return {
    id: row.id,
    job_id: row.job_id,
    job_title: row.job?.title ?? null,
    created_at: row.created_at,
    other_user: other ? toPublicProfile(other) : null,
    last_message: lastMessage,
  };
}

/** Finds the conversation between two users (about a job, or direct when jobId is null). */
export async function findConversation(
  supabase: SupabaseClient,
  userX: string,
  userY: string,
  jobId: string | null
) {
  // A pair is always stored in sorted order (user_a < user_b).
  const [userA, userB] = [userX, userY].sort();

  let query = supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("user_a", userA)
    .eq("user_b", userB);
  query = jobId ? query.eq("job_id", jobId) : query.is("job_id", null);

  const { data } = await query.maybeSingle();
  return data as unknown as ConversationRow | null;
}
