// GET /auth/confirm?token_hash=...&type=email|recovery&next=/somewhere
// Used by the links inside the emails Supabase sends (confirm sign-up, reset password).
// Works even if the user opens the email on a different device than the one they signed up on.
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_ERROR_PATH, safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

const typeSchema = z.enum(["signup", "email", "recovery", "invite", "magiclink", "email_change"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = typeSchema.safeParse(searchParams.get("type"));
  const next = safeNextPath(searchParams.get("next"));
  // Behind Vercel's rewrite, `origin` is the server's internal domain, not the
  // public site domain, so prefer the public URL when it's configured.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? origin).replace(/\/+$/, "");

  if (tokenHash && type.success) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: type.data, token_hash: tokenHash });
    // Success: the user is now signed in (cookies are set). For "recovery" the
    // "next" page lets them choose a new password.
    if (!error) return NextResponse.redirect(`${siteUrl}${next}`);
  }

  return NextResponse.redirect(`${siteUrl}${AUTH_ERROR_PATH}`);
}
