import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const bulkScoreSchema = z.object({
  submissionId: z.string().min(1, "Submission ID required"),
  scores: z.array(
    z.object({
      criteriaId: z.string().min(1),
      scoreValue: z.number().min(0),
      comments: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "JUDGE" && !isAdminOrSuper(session))) {
      return apiError("Unauthorized: Judge or Admin role required", 403);
    }

    const body = await req.json();
    const validated = bulkScoreSchema.parse(body);

    const submission = await db.submission.findUnique({
      where: { id: validated.submissionId },
      include: { team: true },
    });

    if (!submission) return apiError("Submission not found", 404);

    let judgeId = session.userId;

    if (session.role === "JUDGE") {
      const judge = await db.judge.findUnique({
        where: { user_id: session.userId },
      });

      if (!judge) {
        return apiError("Judge profile not found. Please contact administration.", 404);
      }
      judgeId = judge.id;

      // Backend Security: Verify judge is assigned to this team
      const assignment = await db.judgeAssignment.findUnique({
        where: {
          judge_id_team_id: {
            judge_id: judge.id,
            team_id: submission.team_id,
          },
        },
      });

      if (!assignment) {
        return apiError(
          `Unauthorized: You are not assigned to evaluate Team ${submission.team.team_name} (${submission.team.team_code})`,
          403
        );
      }
    }

    // Verify criteria bounds
    const criteriaList = await db.judgingCriteria.findMany();
    const criteriaMap = new Map(criteriaList.map((c) => [c.id, c]));

    const savedScores = [];

    for (const scoreItem of validated.scores) {
      const criteria = criteriaMap.get(scoreItem.criteriaId);
      if (!criteria) continue;

      if (scoreItem.scoreValue > criteria.max_score) {
        return apiError(
          `Score ${scoreItem.scoreValue} exceeds maximum allowed limit of ${criteria.max_score} for "${criteria.name}"`,
          400
        );
      }

      const scoreRecord = await db.score.upsert({
        where: {
          judge_id_submission_id_criteria_id: {
            judge_id: judgeId,
            submission_id: validated.submissionId,
            criteria_id: scoreItem.criteriaId,
          },
        },
        update: {
          score_value: scoreItem.scoreValue,
          comments: scoreItem.comments || null,
          submitted_at: new Date(),
        },
        create: {
          judge_id: judgeId,
          submission_id: validated.submissionId,
          criteria_id: scoreItem.criteriaId,
          score_value: scoreItem.scoreValue,
          comments: scoreItem.comments || null,
        },
      });

      savedScores.push(scoreRecord);
    }

    return apiResponse(true, savedScores, `Scores submitted successfully for Team ${submission.team.team_name}!`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to submit scores", 500);
  }
}
