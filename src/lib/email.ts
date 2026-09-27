import { Resend } from "resend";
import { db } from "./db";

// Only initialize Resend if API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendTicketEmail({
  ticketId,
  teamLeaderEmail,
  teamCode,
  teamName,
  membersList,
  ticketCode,
  qrCodeUrl,
}: {
  ticketId: string;
  teamLeaderEmail: string;
  teamCode: string;
  teamName: string;
  membersList: string[];
  ticketCode: string;
  qrCodeUrl: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  
  const senderEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const recipientEmail = teamLeaderEmail;

  // Build HTML Body Template
  const membersHtml = membersList
    .map((name, idx) => `<li style="padding: 4px 0;">Member ${idx + 1}: <strong>${name}</strong></li>`)
    .join("");

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090d16; color: #f3f4f6; padding: 30px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1f2937;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1f2937;">
        <h1 style="color: #06b6d4; margin: 0; font-size: 28px; letter-spacing: 2px;">VORTEXA 2026</h1>
        <p style="color: #10b981; font-weight: bold; margin-top: 5px; font-size: 14px;">✓ Payment Successfully Verified</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Congratulations!</h2>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
          Your payment for team registration has been officially verified by the VORTEXA organizing committee. Your team status is now <strong>CONFIRMED</strong>.
        </p>

        <div style="background-color: #111726; padding: 15px 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #374151;">
          <p style="margin: 6px 0; font-size: 14px;"><strong>Team ID:</strong> <span style="font-family: monospace; color: #22d3ee; font-size: 16px; font-weight: bold;">${teamCode}</span></p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Team Name:</strong> ${teamName}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Ticket ID:</strong> <span style="font-family: monospace; color: #a855f7; font-weight: bold;">${ticketCode}</span></p>
        </div>

        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 8px;">Team Roster:</h3>
        <ul style="color: #d1d5db; font-size: 14px; padding-left: 20px; margin-top: 0;">
          ${membersHtml}
        </ul>

        <div style="text-align: center; padding: 20px; background-color: #111726; border-radius: 16px; margin: 25px 0; border: 1px solid #06b6d4;">
          <p style="color: #22d3ee; font-weight: bold; margin-top: 0; font-size: 14px;">YOUR EVENT ENTRY QR PASS</p>
          <img src="${qrCodeUrl}" alt="Event Ticket QR Code" style="width: 180px; height: 180px; border-radius: 12px; background: white; padding: 10px;" />
          <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; font-family: monospace; margin-top: 10px;">${ticketCode}</p>
        </div>

        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
          Please keep this ticket safely. Present the QR code on your phone or printed copy at the main entrance check-in desk on event day.
        </p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #1f2937; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">Regards,<br /><strong style="color: #9ca3af;">VORTEXA Organizing Team</strong></p>
        <p style="margin-top: 8px; font-size: 11px;">Sent to ${recipientEmail} | Ref: ${teamCode}</p>
      </div>
    </div>
  `;

  if (!resend) {
    console.error("[Email Error]: RESEND_API_KEY is not configured.");
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        email_status: "FAILED",
        email_error: "RESEND_API_KEY missing",
      },
    });
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `"VORTEXA Platform" <${senderEmail}>`,
      to: recipientEmail,
      subject: `🎉 VORTEXA 2026 Ticket Confirmed — Team ${teamName} (${teamCode})`,
      html: htmlBody,
    });

    if (error) {
      console.error("[Resend Delivery Error]:", error.message);
      await db.ticket.update({
        where: { id: ticketId },
        data: {
          email_status: "FAILED",
          email_error: error.message,
        },
      });
      return { success: false, error: error.message };
    }

    console.log(`[Email Sent via Resend] ID: ${data?.id} to ${recipientEmail}`);

    await db.ticket.update({
      where: { id: ticketId },
      data: {
        email_status: "SENT",
        email_sent_at: new Date(),
        email_error: null,
      },
    });

    return { success: true, message: `Ticket email successfully sent to ${recipientEmail}` };
  } catch (err: any) {
    console.error("[Resend Network/Unknown Error]:", err.message);
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        email_status: "FAILED",
        email_error: err.message || "Unknown error",
      },
    });
    return { success: false, error: err.message || "Unknown error" };
  }
}
