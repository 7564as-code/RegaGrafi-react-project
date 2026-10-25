// Supabase client for the BROWSER (React client components): sign up / sign in.
// Uses only the publishable key, which is safe in the browser because RLS protects the data.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
