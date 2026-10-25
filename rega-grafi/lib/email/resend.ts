// The Resend implementation. Only lib/email/index.ts imports this file,
// so switching to another email service means changing just this file.
import { Resend } from "resend";
import type { EmailMessage } from "@/lib/email";

export async function sendWithResend(message: EmailMessage) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  // Resend returns errors instead of throwing them.
  if (error) throw new Error(error.message);
}
