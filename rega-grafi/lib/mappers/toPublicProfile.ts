// The ONLY place that decides what other users may see of a profile.
// Every API that returns someone else's profile must go through this function,
// so a private field (email, phone, notify_email, role...) can never leak by accident.

export type PublicProfile = {
  id: string;
  display_name: string;
  bio: string | null;
  categories: string[];
  availability: "available" | "unavailable";
  logo_url: string | null;
  portfolio_url: string | null;
};

export function toPublicProfile(row: {
  id: string;
  display_name: string;
  bio: string | null;
  categories: string[];
  availability: string;
  logo_url: string | null;
  portfolio_url: string | null;
}): PublicProfile {
  return {
    id: row.id,
    display_name: row.display_name,
    bio: row.bio,
    categories: row.categories,
    availability: row.availability === "unavailable" ? "unavailable" : "available",
    logo_url: row.logo_url,
    portfolio_url: row.portfolio_url,
  };
}
