// Zod schema for GET /api/designers?availability=&category=&q=&page=&pageSize=
import { z } from "zod";
import { JOB_CATEGORIES } from "@/lib/validation/profile";

export const listDesignersQuerySchema = z.object({
  availability: z.enum(["available", "unavailable"]).optional(),
  category: z.enum(JOB_CATEGORIES).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
