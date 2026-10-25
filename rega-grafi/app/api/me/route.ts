// GET /api/me   -> my full profile (private fields included, it is MY data)
// PATCH /api/me -> update my profile
import { ApiError, handleError, parseBody } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validation/profile";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error || !data) throw new ApiError(404, "NOT_FOUND", "Profile not found");

    // My own email is fine to return to me (never to anyone else).
    return Response.json({ data: { ...data, email: user.email } });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const changes = await parseBody(request, updateProfileSchema);
    if (Object.keys(changes).length === 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "No fields to update");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(changes)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      // 23505 = unique violation: this display_name is already taken.
      if (error.code === "23505") {
        throw new ApiError(409, "DISPLAY_NAME_TAKEN", "This display name is already taken");
      }
      throw new ApiError(500, "UPDATE_FAILED", "Could not update profile");
    }

    return Response.json({ data: { ...data, email: user.email } });
  } catch (err) {
    return handleError(err);
  }
}
