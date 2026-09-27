import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const assignSchema = z.object({
  judgeId: z.string().min(1, "Judge ID is required"),
  teamId: z.string().min(1, "Team ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { judgeId, teamId } = assignSchema.parse(body);

    const assignment = await db.judgeAssignment.upsert({
      where: {
        judge_id_team_id: {
          judge_id: judgeId,
          team_id: teamId,
        },
      },
      update: {
        assigned_at: new Date(),
      },
      create: {
        judge_id: judgeId,
        team_id: teamId,
      },
      include: {
        judge: true,
        team: true,
      },
    });

    return apiResponse(true, assignment, `Judge ${assignment.judge.name} assigned to Team ${assignment.team.team_name}`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to assign judge", 500);
  }
}
