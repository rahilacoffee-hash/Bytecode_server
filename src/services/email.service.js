import { BrevoClient } from "@getbrevo/brevo";
import "dotenv/config";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "BYTECODEE";

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not configured.");
}

if (!SENDER_EMAIL) {
  throw new Error("BREVO_SENDER_EMAIL is not configured.");
}

const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent,
}) {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!htmlContent && !textContent) {
    throw new Error("Email content is required.");
  }

  const emailData = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },

    to: [
      {
        email: to,
      },
    ],

    subject,

    ...(htmlContent && {
      htmlContent,
    }),

    ...(textContent && {
      textContent,
    }),
  };

  return brevo.transactionalEmails.sendTransacEmail(emailData);
}

export async function sendOtpEmail({
  to,
  otp,
  purpose = "verification",
}) {
  const purposeText =
    purpose === "admin-registration"
      ? "verify your BYTECODEE admin account"
      : purpose === "client-recovery"
        ? "recover your BYTECODEE client account"
        : "verify your email address";

  return sendEmail({
    to,
    subject: "Your BYTECODEE verification code",

    htmlContent: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        color: #111111;
      ">
        <h1 style="margin-bottom: 24px;">
          BYTECODEE
        </h1>

        <p>
          Use the verification code below to ${purposeText}.
        </p>

        <div style="
          margin: 24px 0;
          padding: 20px;
          text-align: center;
          background: #f5f5f5;
          border-radius: 12px;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
        ">
          ${otp}
        </div>

        <p>
          This code expires in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this code, you can safely ignore this email.
        </p>

        <p style="margin-top: 32px;">
          — BYTECODEE
        </p>
      </div>
    `,

    textContent: `
BYTECODEE

Use this verification code to ${purposeText}:

${otp}

This code expires in 10 minutes.

If you did not request this code, you can safely ignore this email.

— BYTECODEE
    `,
  });
}