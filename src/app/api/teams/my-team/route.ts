import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.participantId) {
      return apiError("Authentication required", 401);
    }

    const membership = await db.teamMember.findFirst({
      where: { participant_id: session.participantId },
      include: {
        team: {
          include: {
            members: {
              include: {
                participant: {
                  include: {
                    user: {
                      select: {
                        email: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
            payment: true,
            ticket: true,
            checkin: true,
            room_allocation: {
              include: {
                room: true,
              },
            },
            submission: true,
            result: true,
            certificates: true,
          },
        },
      },
    });

    if (!membership || !membership.team) {
      return apiResponse(true, null, "User is not currently in any team");
    }

    const isLeader = membership.team.leader_id === session.participantId;

    return apiResponse(true, {
      team: membership.team,
      isLeader,
      myRole: membership.role,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch team details", 500);
  }
}
