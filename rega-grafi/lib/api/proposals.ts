// Shared bits for the proposals routes.
import { toPublicProfile } from "@/lib/mappers/toPublicProfile";

// A proposal comes with its designer's PUBLIC profile fields only (no email).
export const PROPOSAL_SELECT =
  "*, designer:profiles!designer_id(id, display_name, bio, categories, availability, logo_url, portfolio_url)";

type ProposalRow = { designer: Parameters<typeof toPublicProfile>[0] | null } & Record<string, unknown>;

/** Runs the designer through toPublicProfile, so only safe fields are returned. */
export function toProposalResponse(row: ProposalRow) {
  return { ...row, designer: row.designer ? toPublicProfile(row.designer) : null };
}
