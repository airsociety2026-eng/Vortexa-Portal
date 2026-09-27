import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { sendTicketEmail } from "@/lib/email";
import { z } from "zod";

const resendSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { paymentId } = resendSchema.parse(body);

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
            ticket: true,
          },
        },
        submitted_by: true,
      },
    });

    if (!payment) {
      return apiError("Payment record not found", 404);
    }

    if (payment.status !== "VERIFIED") {
      return apiError("Cannot send ticket email for unverified payment", 400);
    }

    if (!payment.team.ticket) {
      return apiError("No ticket generated for this team yet", 400);
    }

    const ticket = payment.team.ticket;

    const memberNames = payment.team.members.map((m) => m.participant.name);
    const leaderEmail = payment.submitted_by.email;

    const emailResult = await sendTicketEmail({
      ticketId: ticket.id,
      teamLeaderEmail: leaderEmail,
      teamCode: payment.team.team_code,
      teamName: payment.team.team_name,
      membersList: memberNames.length > 0 ? memberNames : ["Team Leader"],
      ticketCode: ticket.ticket_code,
      qrCodeUrl: ticket.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.ticket_code)}`,
    });

    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: "TICKET_EMAIL_RESENT",
      entity: "Ticket",
      entityId: ticket.id,
      details: `Resent ticket email to ${leaderEmail} for Team ${payment.team.team_code}. Status: ${
        emailResult.success ? "SENT" : "FAILED"
      }`,
    });

    if (!emailResult.success) {
      return apiError(emailResult.error || "Failed to resend ticket email", 500);
    }

    return apiResponse(true, { ticket }, `Ticket email successfully resent to ${leaderEmail}`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to resend email", 500);
  }
}
