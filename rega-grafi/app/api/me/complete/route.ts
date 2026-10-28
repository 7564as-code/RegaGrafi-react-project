// POST /api/me/complete -> finish sign-up (step 2).
// The client first saves the details with PATCH /api/me (and POST /api/me/logo),
// then calls this. We re-read the saved profile, check the required fields, and only
// then set onboarded = true. The check is here because the browser can not set that
// column itself (no UPDATE grant), and we must not trust the client to say "I'm done".
import { ApiError, handleError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error || !profile) throw new ApiError(404, "NOT_FOUND", "Profile not found");

    // Already done: calling it again is harmless.
    if (profile.onboarded) {
      return Response.json({ data: { ...profile, email: user.email } });
    }

    const missing: string[] = [];
    // The signup trigger gives everyone "user_<first 8 chars of id>"; they must pick their own.
    if (profile.display_name === `user_${user.id.slice(0, 8)}`) missing.push("display_name");
    // A designer must say what they do, otherwise nobody can find them.
    if (profile.is_designer && profile.categories.length === 0) missing.push("categories");
    if (missing.length > 0) {
      throw new ApiError(400, "ONBOARDING_INCOMPLETE", `Missing required fields: ${missing.join(", ")}`);
    }

    const { data: updated, error: updateError } = await createAdminClient()
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", user.id)
      .select("*")
      .single();
    if (updateError || !updated) throw new ApiError(500, "UPDATE_FAILED", "Could not finish sign-up");

    return Response.json({ data: { ...updated, email: user.email } });
  } catch (err) {
    return handleError(err);
  }
}
