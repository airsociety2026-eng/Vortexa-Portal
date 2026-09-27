import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTeamCode, apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const createTeamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.participantId) {
      return apiError("Authentication & Participant Profile required", 401);
    }

    const body = await req.json();
    const { teamName } = createTeamSchema.parse(body);

    // Check if participant is already in a team
    const existingMembership = await db.teamMember.findFirst({
      where: { participant_id: session.participantId },
    });

    if (existingMembership) {
      return apiError("You are already a member of a team", 400);
    }

    // Generate unique Team Code (VTX26-XXXXX)
    let teamCode = generateTeamCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existingTeam = await db.team.findUnique({
        where: { team_code: teamCode },
      });
      if (!existingTeam) {
        isUnique = true;
      } else {
        teamCode = generateTeamCode();
        attempts++;
      }
    }

    // Create Team and Leader Membership
    const team = await db.team.create({
      data: {
        team_code: teamCode,
        team_name: teamName,
        leader_id: session.participantId,
        status: "PENDING",
        members: {
          create: {
            participant_id: session.participantId,
            role: "LEADER",
          },
        },
      },
      include: {
        members: {
          include: {
            participant: true,
          },
        },
      },
    });

    // Elevate user role to TEAM_LEADER if they were a standard PARTICIPANT
    let newRole = session.role;
    if (session.role === "PARTICIPANT") {
      await db.user.update({
        where: { id: session.userId },
        data: { role: "TEAM_LEADER" },
      });
      newRole = "TEAM_LEADER";
    }

    const res = apiResponse(
      true,
      {
        id: team.id,
        team_code: team.team_code,
        team_name: team.team_name,
        status: team.status,
      },
      `Team "${team.team_name}" created successfully! Your Team ID is ${team.team_code}`
    );

    if (newRole === "TEAM_LEADER" && session.role === "PARTICIPANT") {
      const { signToken } = await import("@/lib/auth");
      const token = signToken({
        userId: session.userId,
        email: session.email,
        role: newRole,
        participantId: session.participantId,
        name: session.name,
      });
      res.cookies.set("vortexa_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }

    return res;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to create team", 500);
  }
}
