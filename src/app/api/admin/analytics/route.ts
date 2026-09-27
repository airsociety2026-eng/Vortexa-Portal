import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const [
      totalParticipants,
      totalTeams,
      confirmedTeams,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
      checkedInTeams,
      totalSubmissions,
      totalCertificates,
      totalRooms,
    ] = await Promise.all([
      db.participant.count(),
      db.team.count(),
      db.team.count({ where: { status: "CONFIRMED" } }),
      db.payment.count({ where: { status: "PENDING" } }),
      db.payment.count({ where: { status: "VERIFIED" } }),
      db.payment.count({ where: { status: "REJECTED" } }),
      db.checkIn.count(),
      db.submission.count(),
      db.certificate.count(),
      db.room.count(),
    ]);

    // Payment stats over time
    const payments = await db.payment.findMany({
      select: { amount: true, status: true },
    });
    const totalRevenue = payments
      .filter((p) => p.status === "VERIFIED")
      .reduce((sum, p) => sum + p.amount, 0);

    return apiResponse(true, {
      totalParticipants,
      totalTeams,
      confirmedTeams,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
      checkedInTeams,
      totalSubmissions,
      totalCertificates,
      totalRooms,
      totalRevenue,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch analytics", 500);
  }
}
