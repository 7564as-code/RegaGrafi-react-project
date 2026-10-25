// GET /api/admin/jobs -> ALL jobs, any status, any owner (admin only)
import { handleError } from "@/lib/api/errors";
import { listJobs } from "@/lib/api/listJobs";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { listJobsQuerySchema, queryToObject } from "@/lib/validation/jobs";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    const query = listJobsQuerySchema.parse(queryToObject(new URL(request.url).searchParams));

    const supabase = await createClient();
    return Response.json(await listJobs(supabase, admin, query));
  } catch (err) {
    return handleError(err);
  }
}
