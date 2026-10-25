// Zod schemas for job requests (body of POST/PATCH and the query string of GET /api/jobs).
import { z } from "zod";
import { JOB_CATEGORIES } from "@/lib/validation/profile";

export const JOB_STATUSES = ["open", "in_progress", "closed"] as const;

const deadline = z.iso.datetime({ offset: true });

// POST /api/jobs - status is NOT accepted: a new job is always 'open', owner is the caller.
export const createJobSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(1).max(5000),
    category: z.enum(JOB_CATEGORIES),
    budget: z.number().min(0).max(10_000_000).nullable().optional(),
    deadline: deadline
      .refine((d) => new Date(d).getTime() > Date.now(), "Deadline must be in the future")
      .nullable()
      .optional(),
  })
  .strict();

// PATCH /api/jobs/[id] - all fields optional; owner_id can never be changed.
export const updateJobSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(1).max(5000),
    category: z.enum(JOB_CATEGORIES),
    budget: z.number().min(0).max(10_000_000).nullable(),
    deadline: deadline.nullable(),
    status: z.enum(JOB_STATUSES),
  })
  .partial()
  .strict();

// GET /api/jobs?q=&category=&status=&sort=&order=&page=&pageSize=
export const listJobsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(JOB_CATEGORIES).optional(),
  status: z.enum(JOB_STATUSES).optional(),
  sort: z.enum(["deadline", "budget", "created_at"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;

/** Shared by the users/jobs admin lists: ?page=&pageSize= */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

/** Turns ?a=1&b= into { a: "1" } (empty values are treated as "not sent"). */
export function queryToObject(searchParams: URLSearchParams) {
  const result: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value !== "") result[key] = value;
  });
  return result;
}
