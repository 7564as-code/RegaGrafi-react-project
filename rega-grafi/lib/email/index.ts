// A small wrapper around the email service, so the rest of the app never talks
// to Resend directly. sendEmail NEVER throws: a failed email must not fail an API request.
import { sendWithResend } from "@/lib/email/resend";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/** Returns true if the email was handed to the email service, false otherwise. */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn("Email not sent: RESEND_API_KEY or EMAIL_FROM is not set");
    return false;
  }

  try {
    await sendWithResend(message);
    console.info("Email handed to Resend");
    return true;
  } catch (err) {
    // Log only the error message: no secrets, no recipient address, no email content.
    console.error("Email failed:", err instanceof Error ? err.message : "unknown error");
    return false;
  }
}
