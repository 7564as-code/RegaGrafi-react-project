// Supabase client for SERVER code (Route Handlers). It reads the user's login
// session from cookies, so every query runs as that user and RLS applies.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // cookies() is async in this version of Next.js.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Refreshed sessions are written back to the cookies.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called where cookies are read-only; proxy.ts refreshes them.
          }
        },
      },
    }
  );
}
