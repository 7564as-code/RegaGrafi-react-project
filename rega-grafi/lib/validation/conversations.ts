// Zod schemas for conversation and message requests.
import { z } from "zod";

// POST /api/conversations
// jobId present   -> conversation about a job (owner <-> a designer who proposed on it)
// jobId missing   -> direct message to an available designer
export const createConversationSchema = z
  .object({
    jobId: z.uuid().optional(),
    otherUserId: z.uuid(),
  })
  .strict();

// GET /api/conversations/[id]/messages?after=<ISO timestamp>  (used for polling)
export const messagesQuerySchema = z.object({
  after: z.iso.datetime({ offset: true }).optional(),
});

// POST /api/conversations/[id]/messages
export const sendMessageSchema = z
  .object({
    body: z.string().trim().min(1).max(5000),
  })
  .strict();
