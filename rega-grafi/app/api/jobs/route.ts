// GET  /api/jobs -> list with search / filter / sort / pagination
// POST /api/jobs -> create a job (the caller becomes the owner)
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import { JOB_SELECT, listJobs } from "@/lib/api/listJobs";
import { requireOnboardedUser, requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { createJobSchema, listJobsQuerySchema, queryToObject } from "@/lib/validation/jobs";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const query = listJobsQuerySchema.parse(queryToObject(new URL(request.url).searchParams));

    const supabase = await createClient();
    return Response.json(await listJobs(supabase, user, query));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireOnboardedUser();
    const body = await parseBody(request, createJobSchema);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      // owner_id always comes from the session, never from the request body.
      .insert({ ...body, owner_id: user.id })
      .select(JOB_SELECT)
      .single();

    if (error) throw new ApiError(500, "CREATE_FAILED", "Could not create the job");
    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
