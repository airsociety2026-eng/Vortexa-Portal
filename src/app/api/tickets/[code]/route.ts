import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return apiError("Authentication required", 401);
    }

    const { code } = params;

    const ticket = await db.ticket.findFirst({
      where: {
        OR: [{ ticket_code: code }, { team: { team_code: code } }],
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                participant: true,
              },
            },
            payment: true,
            checkin: true,
            room_allocation: {
              include: {
                room: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return apiError("Ticket or Team not found for code: " + code, 404);
    }

    return apiResponse(true, ticket);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch ticket", 500);
  }
}
