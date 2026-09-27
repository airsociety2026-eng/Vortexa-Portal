import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    const cert = await db.certificate.findFirst({
      where: {
        certificate_code: code.trim().toUpperCase(),
      },
      include: {
        participant: {
          select: {
            name: true,
            college: true,
            course: true,
          },
        },
        team: {
          select: {
            team_code: true,
            team_name: true,
          },
        },
      },
    });

    if (!cert) {
      return apiError(`No certificate record found for ID: "${code}"`, 404);
    }

    return apiResponse(true, {
      valid: true,
      certificateCode: cert.certificate_code,
      certificateType: cert.certificate_type,
      participantName: cert.participant.name,
      college: cert.participant.college,
      teamCode: cert.team.team_code,
      teamName: cert.team.team_name,
      eventName: cert.event_name,
      issueDate: cert.issue_date,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to verify certificate", 500);
  }
}
