// GET  /api/jobs/[id]/proposals -> proposals on a job.
//        The job owner sees all of them; a designer sees only their own; admin sees all.
//        (Postgres RLS does the filtering.)
// POST /api/jobs/[id]/proposals -> submit a proposal on an open job that is not mine.
import { after } from "next/server";
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import { notifyNewProposal } from "@/lib/email/notifications";
import { PROPOSAL_SELECT, toProposalResponse } from "@/lib/api/proposals";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { profileIdSchema } from "@/lib/validation/profile";
import { createProposalSchema } from "@/lib/validation/proposals";

async function readJobId(ctx: RouteContext<"/api/jobs/[id]/proposals">) {
  const { id } = await ctx.params;
  const parsed = profileIdSchema.safeParse(id);
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "id must be a valid UUID");
  return parsed.data;
}

export async function GET(_request: Request, ctx: RouteContext<"/api/jobs/[id]/proposals">) {
  try {
    await requireUser();
    const jobId = await readJobId(ctx);
    const supabase = await createClient();

    // The job must exist and be visible to me, otherwise 404.
    const { data: job } = await supabase.from("jobs").select("id").eq("id", jobId).maybeSingle();
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");

    const { data, error } = await supabase
      .from("proposals")
      .select(PROPOSAL_SELECT)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load proposals");

    return Response.json({ data: (data ?? []).map((row) => toProposalResponse(row as never)) });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request, ctx: RouteContext<"/api/jobs/[id]/proposals">) {
  try {
    const user = await requireUser();
    const jobId = await readJobId(ctx);
    const body = await parseBody(request, createProposalSchema);
    const supabase = await createClient();

    const { data: job } = await supabase
      .from("jobs")
      .select("id, owner_id, status, title")
      .eq("id", jobId)
      .maybeSingle();
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");
    if (job.owner_id === user.id) {
      throw new ApiError(403, "OWN_JOB", "You cannot submit a proposal on your own job");
    }
    if (job.status !== "open") {
      throw new ApiError(409, "JOB_NOT_OPEN", "This job is not open for proposals");
    }

    const { data, error } = await supabase
      .from("proposals")
      // designer_id comes from the session; status starts as 'pending'.
      .insert({ ...body, job_id: jobId, designer_id: user.id })
      .select(PROPOSAL_SELECT)
      .single();

    if (error) {
      // 23505 = unique violation: this designer already proposed on this job.
      if (error.code === "23505") {
        throw new ApiError(409, "ALREADY_PROPOSED", "You already submitted a proposal on this job");
      }
      throw new ApiError(500, "CREATE_FAILED", "Could not submit the proposal");
    }

    // Email the job owner after the response is sent; a failure here never affects the request.
    after(() => notifyNewProposal({ jobId, jobTitle: job.title, ownerId: job.owner_id }));

    return Response.json({ data: toProposalResponse(data as never) }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
