import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const joinTeamSchema = z.object({
  teamCode: z.string().min(3, "Team Code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.participantId) {
      return apiError("Authentication & Participant Profile required", 401);
    }

    const body = await req.json();
    const { teamCode } = joinTeamSchema.parse(body);

    const team = await db.team.findUnique({
      where: { team_code: teamCode.trim().toUpperCase() },
      include: {
        members: true,
      },
    });

    if (!team) {
      return apiError("Invalid Team ID. No team found with code: " + teamCode, 404);
    }

    // Check if user is already in a team
    const existingMembership = await db.teamMember.findFirst({
      where: { participant_id: session.participantId },
    });

    if (existingMembership) {
      return apiError("You are already a member of a team", 400);
    }

    // Check team size limit (Max 4 members)
    if (team.members.length >= 4) {
      return apiError(`Team ${team.team_name} is already full (Maximum 4 members allowed)`, 400);
    }

    // Add member
    await db.teamMember.create({
      data: {
        team_id: team.id,
        participant_id: session.participantId,
        role: "MEMBER",
      },
    });

    return apiResponse(
      true,
      {
        team_id: team.id,
        team_code: team.team_code,
        team_name: team.team_name,
      },
      `Successfully joined team "${team.team_name}" (${team.team_code})!`
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to join team", 500);
  }
}
