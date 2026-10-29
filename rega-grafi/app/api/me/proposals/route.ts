// GET /api/me/proposals -> all proposals the signed-in user has submitted, newest first.
import { ApiError, handleError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const { data: proposals, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("designer_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load proposals");

    // The job's jobs-table RLS policy hides it once it's no longer open and I'm
    // not its owner (e.g. another employer closed it after accepting someone).
    // I still submitted a real proposal on it, so look it up with the admin
    // client, selecting only the public fields the client is allowed to see.
    const jobIds = [...new Set((proposals ?? []).map((p) => p.job_id as string))];
    const jobs = new Map<string, { id: string; title: string; status: string }>();
    if (jobIds.length > 0) {
      const { data: jobRows, error: jobsError } = await createAdminClient()
        .from("jobs")
        .select("id, title, status")
        .in("id", jobIds);
      if (jobsError) throw new ApiError(500, "QUERY_FAILED", "Could not load proposals");
      for (const job of jobRows ?? []) jobs.set(job.id, job);
    }

    const data = (proposals ?? []).map((p) => ({ ...p, job: jobs.get(p.job_id as string) ?? null }));
    return Response.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
