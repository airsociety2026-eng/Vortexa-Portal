import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper, isStaff } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isStaff(session)) {
      return apiError("Unauthorized: Staff role required", 403);
    }

    const teams = await db.team.findMany({
      include: {
        members: {
          include: {
            participant: {
              include: {
                user: { select: { email: true, role: true } },
              },
            },
          },
        },
        payment: true,
        ticket: true,
        checkin: true,
        room_allocation: {
          include: { room: true },
        },
        submission: true,
        result: true,
        certificates: true,
      },
      orderBy: { created_at: "desc" },
    });

    return apiResponse(true, teams);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch all teams", 500);
  }
}
