// GET /auth/callback?code=...&next=/somewhere
// Used after "Sign in with Google": Supabase sends the user back here with a one-time
// code. We swap the code for a login session (stored in cookies) and redirect on.
import { NextResponse } from "next/server";
import { AUTH_ERROR_PATH, safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${AUTH_ERROR_PATH}`);
}
