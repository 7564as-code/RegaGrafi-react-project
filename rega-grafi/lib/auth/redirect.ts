// Helpers for the /auth/* routes (the links people open from emails or after Google sign-in).

// Where to send people if the link is invalid or expired. Change to match your React pages.
export const AUTH_ERROR_PATH = "/login?error=auth";

/**
 * "next" comes from the URL, so it must be checked: only a path inside our own site is allowed.
 * Otherwise an attacker could craft a link that sends users to a fake website after login
 * (an "open redirect").
 */
export function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  return next;
}
