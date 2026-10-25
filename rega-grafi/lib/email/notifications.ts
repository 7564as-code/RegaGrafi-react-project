// The two emails the site sends: "new proposal on your job" and "new chat message".
// Privacy: an email contains only a short sentence + a link. Never the message text,
// never the other person's email or name.
import { sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Where the links in the emails point. Change these paths to match your React pages.
const jobLink = (jobId: string) => `${SITE_URL}/jobs/${jobId}`;
const conversationLink = (conversationId: string) => `${SITE_URL}/conversations/${conversationId}`;

const MIN_MINUTES_BETWEEN_MESSAGE_EMAILS = 5;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Removes line breaks, so a job title can never inject extra email headers. */
function oneLine(text: string) {
  return text.replace(/[\r\n]+/g, " ").trim();
}

// Optional. Must be a full public https URL (email apps cannot load relative paths).
const LOGO_URL = process.env.EMAIL_LOGO_URL;

const BUTTON_TEXT = "לצפייה באתר";
const BRAND_NAME = "רגע גרפי";
const BUTTON_COLOR = "#6c4df5";

// The subject is the same for every email of a kind (the job title stays in the email body),
// so Gmail and similar apps group repeated emails into one conversation.
const PROPOSAL_SUBJECT = `${BRAND_NAME} - יש לך הצעה חדשה`;
const MESSAGE_SUBJECT = `${BRAND_NAME} - יש לך הודעה חדשה`;

// Email apps ignore most CSS, so the layout is a table with inline styles.
// Light gray page, white rounded card, pill button, everything right-to-left.
export function buildEmail(to: string, subject: string, sentence: string, link: string) {
  const safeLink = escapeHtml(link);
  const logo = LOGO_URL
    ? `<img src="${escapeHtml(LOGO_URL)}" alt="${BRAND_NAME}" style="max-height:60px;max-width:200px;margin-bottom:24px">`
    : "";
  const html = `<!doctype html>
<html dir="rtl" lang="he">
<body style="margin:0;padding:0;background:#f3f4f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px">
<tr><td dir="rtl" align="right" style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#111827;text-align:right">
${logo}
<p style="margin:0 0 24px;font-size:18px;line-height:1.5">${escapeHtml(sentence)}</p>
<a href="${safeLink}" style="display:inline-block;background:${BUTTON_COLOR};color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:12px 32px;border-radius:999px">${BUTTON_TEXT}</a>
<p style="margin:32px 0 0;font-size:12px;color:#6b7280">${BRAND_NAME}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return {
    to,
    subject,
    text: `${sentence}\n\n${BUTTON_TEXT}: ${link}\n\n${BRAND_NAME}`,
    html,
  };
}

/**
 * Finds where to send an email for this user. Returns null if the user switched
 * notifications off. Uses the admin client because the email address lives in
 * Supabase Auth and is not readable with a normal user session.
 */
async function getRecipientEmail(userId: string) {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("notify_email")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.notify_email) {
    console.info("Email skipped: the user switched notifications off (or has no profile)");
    return null;
  }

  const { data } = await admin.auth.admin.getUserById(userId);
  if (!data.user?.email) console.info("Email skipped: the user has no email address");
  return data.user?.email ?? null;
}

/** Someone submitted a proposal on the job owner's job. */
export async function notifyNewProposal(args: { jobId: string; jobTitle: string; ownerId: string }) {
  try {
    const email = await getRecipientEmail(args.ownerId);
    if (!email) return;

    const sentence = `יש לך הצעה חדשה על ${oneLine(args.jobTitle)}`;
    await sendEmail(buildEmail(email, PROPOSAL_SUBJECT, sentence, jobLink(args.jobId)));
  } catch (err) {
    console.error("Proposal notification failed:", err instanceof Error ? err.message : "unknown");
  }
}

/** Someone sent a chat message. At most one email per conversation per 5 minutes. */
export async function notifyNewMessage(args: { conversationId: string; senderId: string }) {
  try {
    const admin = createAdminClient();

    const { data: conversation } = await admin
      .from("conversations")
      .select("id, user_a, user_b, job:jobs!job_id(title)")
      .eq("id", args.conversationId)
      .maybeSingle();
    if (!conversation) return;

    // The receiver is the participant who is not the sender.
    const receiverId = conversation.user_a === args.senderId ? conversation.user_b : conversation.user_a;

    const email = await getRecipientEmail(receiverId);
    if (!email) return;

    // Rate limit. This single UPDATE both checks and claims the slot, so two messages
    // sent at the same moment cannot both send an email.
    const cutoff = new Date(Date.now() - MIN_MINUTES_BETWEEN_MESSAGE_EMAILS * 60_000).toISOString();
    const { data: claimed } = await admin
      .from("conversations")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", conversation.id)
      .or(`last_notified_at.is.null,last_notified_at.lt.${cutoff}`)
      .select("id");
    if (!claimed || claimed.length === 0) {
      console.info("Email skipped: an email for this conversation was already sent in the last 5 minutes");
      return;
    }

    const job = Array.isArray(conversation.job) ? conversation.job[0] : conversation.job;
    const sentence = job?.title
      ? `יש לך הודעה חדשה על ${oneLine(job.title)}`
      : "יש לך הודעה חדשה";
    await sendEmail(buildEmail(email, MESSAGE_SUBJECT, sentence, conversationLink(conversation.id)));
  } catch (err) {
    console.error("Message notification failed:", err instanceof Error ? err.message : "unknown");
  }
}
