/**
 * Email utilities for Instant Teacher.
 * For MVP, we'll use a simple console log approach.
 * In production, integrate with a service like SendGrid, Resend, or AWS SES.
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

  // TODO: Replace with actual email service integration
  // Example with Resend:
  // await resend.emails.send({
  //   from: "Instant Teacher <noreply@instantteacher.com>",
  //   to: data.parentEmail,
  //   subject: `Session Extended: ${data.extensionMinutes} minutes added`,
  //   html: `...`,
  // });
}
