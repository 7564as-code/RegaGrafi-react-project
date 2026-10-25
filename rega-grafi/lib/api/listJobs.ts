// Builds the "list jobs" query. Shared by GET /api/jobs and GET /api/admin/jobs.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
import type { CurrentUser } from "@/lib/auth/getCurrentUser";
import type { ListJobsQuery } from "@/lib/validation/jobs";

// A job comes with a SAFE summary of its owner (no email, only public fields).
export const JOB_SELECT = "*, owner:profiles!owner_id(id, display_name, logo_url)";

/** Makes user text safe inside a PostgREST filter and a LIKE pattern. */
export function escapeSearch(text: string) {
  return text
    .replace(/[,()*]/g, " ") // characters that would break the filter syntax
    .replace(/[\\%_]/g, (c) => "\\" + c); // LIKE wildcards are treated as normal text
}

export async function listJobs(
  supabase: SupabaseClient,
  user: CurrentUser,
  query: ListJobsQuery
) {
  let builder = supabase.from("jobs").select(JOB_SELECT, { count: "exact" });

  // Permissions in the API code (RLS in Postgres enforces the same rule again):
  // a regular user sees open jobs + their own. An admin sees everything.
  if (user.role !== "admin") {
    builder = builder.or(`status.eq.open,owner_id.eq.${user.id}`);
  }

  if (query.category) builder = builder.eq("category", query.category);
  if (query.status) builder = builder.eq("status", query.status);

  if (query.q) {
    const pattern = `%${escapeSearch(query.q)}%`;
    builder = builder.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  const { data, count, error } = await builder
    .order(query.sort, { ascending: query.order === "asc", nullsFirst: false })
    .order("id") // stable order when many rows share the same value
    .range(from, to);

  if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load jobs");

  return {
    data: data ?? [],
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total: count ?? 0,
    },
  };
}
