// Supabase ADMIN client: uses the secret key and BYPASSES RLS.
// SERVER ONLY. Never import this file from a client component.
// Use it only for tasks that really need it (e.g. updating last_notified_at).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient must never run in the browser");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
