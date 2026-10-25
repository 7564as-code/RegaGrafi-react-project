// GET /api/profiles/[id] -> the PUBLIC view of a profile (only safe fields).
import { ApiError, handleError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { toPublicProfile } from "@/lib/mappers/toPublicProfile";
import { createClient } from "@/lib/supabase/server";
import { profileIdSchema } from "@/lib/validation/profile";

export async function GET(_request: Request, ctx: RouteContext<"/api/profiles/[id]">) {
  try {
    await requireUser(); // profiles are visible to signed-in users only

    const { id } = await ctx.params;
    const parsedId = profileIdSchema.safeParse(id);
    if (!parsedId.success) throw new ApiError(400, "VALIDATION_ERROR", "id must be a valid UUID");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, bio, categories, availability, logo_url, portfolio_url")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load the profile");
    if (!data) throw new ApiError(404, "NOT_FOUND", "Profile not found");

    return Response.json({ data: toPublicProfile(data) });
  } catch (err) {
    return handleError(err);
  }
}
