import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { sendReminderEmail } from "@/lib/email";
import { z } from "zod";

const remindSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { teamId } = remindSchema.parse(body);

    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            participant: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!team) {
      return apiError("Team not found", 404);
    }

    // Find leader email
    const leaderMember = team.members.find((m) => m.role === "LEADER" || m.participant.user_id === team.leader_id);
    const leaderEmail = leaderMember?.participant?.user?.email;

    if (!leaderEmail) {
      return apiError("Leader email not found", 400);
    }

    const emailResult = await sendReminderEmail({
      teamLeaderEmail: leaderEmail,
      teamCode: team.team_code,
      teamName: team.team_name,
    });

    if (!emailResult.success) {
      return apiError(emailResult.error || "Failed to send email", 500);
    }

    return apiResponse(true, null, "Reminder email sent successfully!");
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}
