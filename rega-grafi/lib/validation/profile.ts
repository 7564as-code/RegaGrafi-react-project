// Zod schemas for profile requests. Zod checks that incoming data has the right shape.
import { z } from "zod";

export const JOB_CATEGORIES = ["logo", "flyer", "banner", "social", "video", "ad", "other"] as const;

// Fields a user may change on their own profile.
// role and logo_url are NOT here: role can never be changed from the API,
// and logo_url is set only by POST /api/me/logo.
export const updateProfileSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[\p{L}\p{N}_. -]+$/u, "Only letters, numbers, spaces and _ . -"),
    bio: z.string().trim().max(500).nullable(),
    categories: z.array(z.enum(JOB_CATEGORIES)).max(5),
    is_designer: z.boolean(),
    availability: z.enum(["available", "unavailable"]),
    portfolio_url: z.url().max(300).nullable(),
    notify_email: z.boolean(),
  })
  .partial() // every field is optional in a PATCH
  .strict(); // unknown fields (like "role") are rejected, not ignored

export const profileIdSchema = z.uuid();
