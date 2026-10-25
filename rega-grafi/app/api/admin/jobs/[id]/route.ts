// DELETE /api/admin/jobs/[id] -> delete ANY job (admin only)
import { ApiError, handleError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { profileIdSchema } from "@/lib/validation/profile";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/jobs/[id]">) {
  try {
    await requireAdmin();

    const { id } = await ctx.params;
    const parsed = profileIdSchema.safeParse(id);
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "id must be a valid UUID");

    const supabase = await createClient();
    const { data, error } = await supabase.from("jobs").delete().eq("id", parsed.data).select("id");
    if (error) throw new ApiError(500, "DELETE_FAILED", "Could not delete the job");
    if (!data || data.length === 0) throw new ApiError(404, "NOT_FOUND", "Job not found");

    return Response.json({ data: { id: parsed.data } });
  } catch (err) {
    return handleError(err);
  }
}
