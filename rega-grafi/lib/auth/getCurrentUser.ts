// Who is making this request? Reads the session from cookies and the role from profiles.
// The role always comes from the database, never from the client.
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | undefined; // only ever returned to the user themselves
  role: "user" | "admin";
  onboarded: boolean; // false until the user finishes the second sign-up step
};

/** Returns the signed-in user, or null if there is no valid session. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  // getUser() asks Supabase to validate the token, so it can be trusted.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarded")
    .eq("id", data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email,
    role: profile?.role === "admin" ? "admin" : "user",
    onboarded: profile?.onboarded === true,
  };
}

/** Like getCurrentUser, but throws 401 when nobody is signed in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "You must be signed in");
  return user;
}

/**
 * For actions that create something (job, proposal, conversation, message):
 * 401 if not signed in. The PROFILE_INCOMPLETE gate is disabled for now;
 * re-enable by throwing when !user.onboarded again.
 */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  return requireUser();
}

/** Throws 401 if not signed in, 403 if signed in but not an admin. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new ApiError(403, "FORBIDDEN", "Admins only");
  return user;
}
