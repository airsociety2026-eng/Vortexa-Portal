import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const rejectSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  rejectionReason: z.string().min(3, "Rejection reason is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { paymentId, rejectionReason } = rejectSchema.parse(body);

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { team: true },
    });

    if (!payment) {
      return apiError("Payment record not found", 404);
    }

    // Update payment to REJECTED
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: "REJECTED",
        rejection_reason: rejectionReason,
        verified_at: new Date(),
        verified_by_id: session!.userId,
      },
    });

    // Reset team status to PENDING
    await db.team.update({
      where: { id: payment.team_id },
      data: { status: "PENDING" },
    });

    // Create Notification
    await db.notification.create({
      data: {
        user_id: payment.submitted_by_id,
        title: "⚠️ Payment Rejected",
        message: `Your payment for Team ${payment.team.team_name} was rejected. Reason: "${rejectionReason}". Please re-submit proof with valid details.`,
        type: "WARNING",
      },
    });

    // Audit Log
    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: "PAYMENT_REJECTED",
      entity: "Payment",
      entityId: payment.id,
      details: `Rejected UTR ${payment.utr_number} for Team ${payment.team.team_code}. Reason: ${rejectionReason}`,
    });

    return apiResponse(true, updatedPayment, "Payment rejected and notification sent.");
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to reject payment", 500);
  }
}
