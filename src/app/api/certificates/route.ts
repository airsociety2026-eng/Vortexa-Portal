import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { generateCertificateCode, apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const certSchema = z.object({
  participantId: z.string().min(1, "Participant ID required"),
  teamId: z.string().min(1, "Team ID required"),
  certificateType: z.enum(["PARTICIPATION", "FINALIST", "WINNER", "RUNNER_UP", "SPECIAL_AWARD"]).default("PARTICIPATION"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return apiError("Authentication required", 401);

    if (isAdminOrSuper(session)) {
      const certificates = await db.certificate.findMany({
        include: {
          participant: true,
          team: true,
        },
        orderBy: { issue_date: "desc" },
      });
      return apiResponse(true, certificates);
    }

    if (!session.participantId) return apiError("Participant profile required", 400);

    const certificates = await db.certificate.findMany({
      where: { participant_id: session.participantId },
      include: {
        participant: true,
        team: true,
      },
    });

    return apiResponse(true, certificates);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch certificates", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const validated = certSchema.parse(body);

    const certCode = generateCertificateCode();

    const cert = await db.certificate.create({
      data: {
        certificate_code: certCode,
        participant_id: validated.participantId,
        team_id: validated.teamId,
        certificate_type: validated.certificateType,
        event_name: "VORTEXA 2026",
        issue_date: new Date(),
      },
      include: {
        participant: true,
        team: true,
      },
    });

    return apiResponse(true, cert, `Certificate ${cert.certificate_code} issued successfully!`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to generate certificate", 500);
  }
}
