// Zod schemas for proposal requests.
import { z } from "zod";

// POST /api/jobs/[id]/proposals - designer_id and status are NOT accepted from the client.
export const createProposalSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
    price: z.number().min(0).max(10_000_000),
    delivery_hours: z.number().int().min(1).max(10_000),
  })
  .strict();

// PATCH /api/proposals/[id] - the job owner accepts or rejects.
export const decideProposalSchema = z
  .object({
    status: z.enum(["accepted", "rejected"]),
  })
  .strict();
