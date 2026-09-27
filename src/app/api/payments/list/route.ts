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

    const payments = await db.payment.findMany({
      include: {
        team: {
          include: {
            members: {
              include: { participant: true },
            },
          },
        },
        submitted_by: {
          select: { email: true },
        },
      },
      orderBy: { submitted_at: "desc" },
    });

    return apiResponse(true, payments);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch payments", 500);
  }
}
