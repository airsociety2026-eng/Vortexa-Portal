import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { generateTicketCode, apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { sendTicketEmail } from "@/lib/email";
import { z } from "zod";

const verifySchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { paymentId } = verifySchema.parse(body);

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        team: {
          include: {
            members: {
              include: {
                participant: {
                  include: { user: true },
                },
              },
            },
          },
        },
        submitted_by: true,
      },
    });

    if (!payment) {
      return apiError("Payment record not found", 404);
    }

    // Update payment to VERIFIED
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: "VERIFIED",
        verified_at: new Date(),
        verified_by_id: session!.userId,
        rejection_reason: null,
      },
    });

    // Confirm Team
    await db.team.update({
      where: { id: payment.team_id },
      data: { status: "CONFIRMED" },
    });

    // Reuse existing ticket if present, otherwise generate new
    const existingTicket = await db.ticket.findUnique({
      where: { team_id: payment.team_id },
    });

    let ticketCode = existingTicket?.ticket_code || generateTicketCode();
    const qrUrl = existingTicket?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketCode)}`;

    const ticket = await db.ticket.upsert({
      where: { team_id: payment.team_id },
      update: {
        status: "ACTIVE",
      },
      create: {
        ticket_code: ticketCode,
        team_id: payment.team_id,
        status: "ACTIVE",
        qr_code_url: qrUrl,
        email_status: "PENDING",
      },
    });

    // Collect team members names for email
    const memberNames = payment.team.members.map(
      (m) => m.participant.name
    );

    // Leader email from submitted_by or user record
    const leaderEmail = payment.submitted_by.email;

    // Send Ticket Email asynchronously without breaking payment verification if email fails
    const emailResult = await sendTicketEmail({
      ticketId: ticket.id,
      teamLeaderEmail: leaderEmail,
      teamCode: payment.team.team_code,
      teamName: payment.team.team_name,
      membersList: memberNames.length > 0 ? memberNames : ["Team Leader"],
      ticketCode: ticket.ticket_code,
      qrCodeUrl: ticket.qr_code_url || qrUrl,
    });

    // Create In-App Notification for Team Leader
    await db.notification.create({
      data: {
        user_id: payment.submitted_by_id,
        title: "🎉 Payment Verified & Ticket Generated!",
        message: `Your payment of ₹${payment.amount} for Team ${payment.team.team_name} (${payment.team.team_code}) has been verified. Your ticket is ACTIVE.${
          emailResult.success ? " Ticket email has been sent." : " (Email delivery status updated)."
        }`,
        type: "SUCCESS",
      },
    });

    // Audit Log
    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: "PAYMENT_VERIFIED",
      entity: "Payment",
      entityId: payment.id,
      details: `Verified UTR ${payment.utr_number} for Team ${payment.team.team_code}. Ticket ${ticket.ticket_code} generated. Email status: ${emailResult.success ? 'SENT' : 'FAILED'}.`,
    });

    return apiResponse(
      true,
      { payment: updatedPayment, ticket, emailResult },
      `Payment verified and ticket ${ticket.ticket_code} generated successfully! ${
        emailResult.success ? "Ticket email sent to " + leaderEmail : "Note: Ticket email failed to deliver, admin can resend."
      }`
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to verify payment", 500);
  }
}

