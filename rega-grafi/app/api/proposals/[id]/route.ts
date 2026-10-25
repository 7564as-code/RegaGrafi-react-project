// PATCH /api/proposals/[id] -> the JOB OWNER accepts or rejects a pending proposal.
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import { PROPOSAL_SELECT, toProposalResponse } from "@/lib/api/proposals";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { profileIdSchema } from "@/lib/validation/profile";
import { decideProposalSchema } from "@/lib/validation/proposals";

export async function PATCH(request: Request, ctx: RouteContext<"/api/proposals/[id]">) {
  try {
    const user = await requireUser();

    const { id } = await ctx.params;
    const parsedId = profileIdSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError(400, "VALIDATION_ERROR", "id must be a valid UUID");

    const { status } = await parseBody(request, decideProposalSchema);
    const supabase = await createClient();

    // RLS only shows me proposals I wrote or proposals on my jobs (or all, for admin).
    const { data: proposal } = await supabase
      .from("proposals")
      .select("id, status, job:jobs!job_id(owner_id)")
      .eq("id", parsedId.data)
      .maybeSingle();
    if (!proposal) throw new ApiError(404, "NOT_FOUND", "Proposal not found");

    // Supabase types a to-one embed loosely, so read it carefully.
    const job = Array.isArray(proposal.job) ? proposal.job[0] : proposal.job;
    if (job?.owner_id !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "Only the job owner can accept or reject a proposal");
    }
    if (proposal.status !== "pending") {
      throw new ApiError(409, "ALREADY_DECIDED", "This proposal was already accepted or rejected");
    }

    const { data, error } = await supabase
      .from("proposals")
      .update({ status })
      .eq("id", parsedId.data)
      .select(PROPOSAL_SELECT)
      .maybeSingle();
    if (error) throw new ApiError(500, "UPDATE_FAILED", "Could not update the proposal");
    if (!data) throw new ApiError(403, "FORBIDDEN", "Only the job owner can accept or reject a proposal");

    return Response.json({ data: toProposalResponse(data as never) });
  } catch (err) {
    return handleError(err);
  }
}
