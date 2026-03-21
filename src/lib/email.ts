/**
 * Email utilities for Instant Teacher.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs to console.
 */

interface ExtensionEmailData {
  parentEmail: string;
  parentName: string;
  studentName: string;
  sessionId: string;
  extensionMinutes: number;
  priceCents: number;
  newEndTime: Date;
}

export interface NewTeacherNotificationData {
  teacherEmail: string;
  fullName: string;
  teacherType: string;
  mobile: string;
  schoolName?: string;
  university?: string;
  subjects: string[];
  yearLevels: number[];
  wwccNumber?: string;
  teacherRegistrationNumber?: string;
}

/**
 * Send email notification to parent about session extension.
 * TODO: Integrate with actual email service (SendGrid, Resend, etc.)
 */
export async function sendExtensionEmail(data: ExtensionEmailData): Promise<void> {
  // For MVP, log to console. In production, replace with actual email service.
  console.log("📧 Extension Email Notification:", {
    to: data.parentEmail,
    subject: `Session Extended: ${data.extensionMinutes} minutes added`,
    body: `
Hello ${data.parentName},

Your tutoring session with ${data.studentName} has been extended by ${data.extensionMinutes} minutes.

Details:
- Session ID: ${data.sessionId}
- Extension: ${data.extensionMinutes} minutes
- Charge: $${(data.priceCents / 100).toFixed(2)}
- New end time: ${data.newEndTime.toLocaleString("en-AU", { timeZone: "Australia/Perth" })}

This charge has been processed using your saved payment method.

If you have any questions, please contact support.

Best regards,
Instant Teacher
    `.trim(),
  });

  // TODO: Replace with actual email service integration when needed
}

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL?.trim();
const RESEND_FROM = process.env.RESEND_FROM?.trim() || "Instant Teacher <onboarding@resend.dev>";

/**
 * Send email to admin when a new teacher registers.
 * Requires: ADMIN_NOTIFY_EMAIL, and RESEND_API_KEY for actual delivery.
 * If Resend is not configured, logs to console only.
 */
export async function sendNewTeacherNotificationEmail(data: NewTeacherNotificationData): Promise<void> {
  const to = ADMIN_NOTIFY_EMAIL;
  if (!to) {
    console.warn("ADMIN_NOTIFY_EMAIL not set; skipping new teacher notification email.");
    return;
  }

  const subject = `New teacher registration: ${data.fullName}`;
  const body = `
A new teacher has registered on Instant Teacher.

Name: ${data.fullName}
Email: ${data.teacherEmail}
Type: ${data.teacherType}
Mobile: ${data.mobile}
School: ${data.schoolName ?? "—"}
University: ${data.university ?? "—"}
Subjects: ${data.subjects.join(", ")}
Year levels: ${data.yearLevels.join(", ")}
WWCC number: ${data.wwccNumber ?? "—"}
Teacher registration number: ${data.teacherRegistrationNumber ?? "—"}

Review and approve at: ${process.env.NEXT_PUBLIC_APP_URL || "your-app-url"}/admin/registrations
  `.trim();

  if (RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: RESEND_FROM,
        to: [to],
        subject,
        text: body,
      });
      if (error) {
        console.error("Resend new-teacher email error:", error);
      }
    } catch (err) {
      console.error("Failed to send new teacher notification email:", err);
    }
  } else {
    console.log("📧 New Teacher Notification (no RESEND_API_KEY; email not sent):", { to, subject, body });
  }
}
