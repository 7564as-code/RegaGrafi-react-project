// GET    /api/jobs/[id] -> one job (open, or mine, or any if admin)
// PATCH  /api/jobs/[id] -> edit (owner or admin)
// DELETE /api/jobs/[id] -> delete (owner or admin)
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import { JOB_SELECT } from "@/lib/api/listJobs";
import { requireUser, type CurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { updateJobSchema } from "@/lib/validation/jobs";
import { profileIdSchema } from "@/lib/validation/profile";

/** Reads the id from the URL and checks it looks like a UUID. */
async function readId(ctx: RouteContext<"/api/jobs/[id]">) {
  const { id } = await ctx.params;
  const parsed = profileIdSchema.safeParse(id);
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "id must be a valid UUID");
  return parsed.data;
}

/** Loads a job the caller may see, or throws 404. (RLS hides jobs the caller may not see.) */
async function loadJob(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("jobs").select(JOB_SELECT).eq("id", id).maybeSingle();
  if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load the job");
  if (!data) throw new ApiError(404, "NOT_FOUND", "Job not found");
  return data;
}

/** Only the owner or an admin may change a job. Others get 403. */
function assertCanModify(user: CurrentUser, job: { owner_id: string }) {
  if (user.role !== "admin" && job.owner_id !== user.id) {
    throw new ApiError(403, "FORBIDDEN", "You can only change your own jobs");
  }
}

export async function GET(_request: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  try {
    await requireUser();
    const supabase = await createClient();
    return Response.json({ data: await loadJob(supabase, await readId(ctx)) });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  try {
    const user = await requireUser();
    const id = await readId(ctx);
    const changes = await parseBody(request, updateJobSchema);
    if (Object.keys(changes).length === 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "No fields to update");
    }

    const supabase = await createClient();
    assertCanModify(user, await loadJob(supabase, id));

    const { data, error } = await supabase
      .from("jobs")
      .update(changes)
      .eq("id", id)
      .select(JOB_SELECT)
      .maybeSingle();
    if (error) throw new ApiError(500, "UPDATE_FAILED", "Could not update the job");
    if (!data) throw new ApiError(403, "FORBIDDEN", "You can only change your own jobs");

    return Response.json({ data });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  try {
    const user = await requireUser();
    const id = await readId(ctx);

    const supabase = await createClient();
    assertCanModify(user, await loadJob(supabase, id));

    const { data, error } = await supabase.from("jobs").delete().eq("id", id).select("id");
    if (error) throw new ApiError(500, "DELETE_FAILED", "Could not delete the job");
    if (!data || data.length === 0) {
      throw new ApiError(403, "FORBIDDEN", "You can only delete your own jobs");
    }

    return Response.json({ data: { id } });
  } catch (err) {
    return handleError(err);
  }
}
