import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const submitPaymentSchema = z.object({
  payerName: z.string().min(2, "Payer name is required"),
  upiId: z.string().min(3, "UPI ID is required"),
  utrNumber: z.string().min(6, "Valid UTR / Transaction ID is required"),
  amount: z.number().min(1, "Valid amount required"),
  screenshotUrl: z.string().min(1, "Payment screenshot proof is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.participantId) {
      return apiError("Authentication required", 401);
    }

    // Verify user is Team Leader
    const membership = await db.teamMember.findFirst({
      where: { participant_id: session.participantId, role: "LEADER" },
      include: { team: true },
    });

    if (!membership || !membership.team) {
      return apiError("Only the Team Leader can submit payment proof for the team", 403);
    }

    const team = membership.team;
    const body = await req.json();
    const validated = submitPaymentSchema.parse(body);

    // Check if UTR is already used by another team
    const existingPaymentWithUTR = await db.payment.findUnique({
      where: { utr_number: validated.utrNumber.trim() },
    });

    if (existingPaymentWithUTR && existingPaymentWithUTR.team_id !== team.id) {
      return apiError("This UTR / Transaction ID has already been submitted by another team", 400);
    }

    // Upsert payment proof
    const payment = await db.payment.upsert({
      where: { team_id: team.id },
      update: {
        submitted_by_id: session.userId,
        payer_name: validated.payerName,
        upi_id: validated.upiId,
        utr_number: validated.utrNumber.trim(),
        amount: validated.amount,
        screenshot_url: validated.screenshotUrl,
        status: "PENDING",
        rejection_reason: null,
        submitted_at: new Date(),
      },
      create: {
        team_id: team.id,
        submitted_by_id: session.userId,
        payer_name: validated.payerName,
        upi_id: validated.upiId,
        utr_number: validated.utrNumber.trim(),
        amount: validated.amount,
        screenshot_url: validated.screenshotUrl,
        status: "PENDING",
        submitted_at: new Date(),
      },
    });

    return apiResponse(
      true,
      payment,
      "Payment proof submitted successfully! Verification is now pending admin review."
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to submit payment", 500);
  }
}
