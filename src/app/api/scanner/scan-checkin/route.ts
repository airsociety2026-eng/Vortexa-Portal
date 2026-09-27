import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const scanCheckinSchema = z.object({
  ticketCode: z.string().min(1, "Ticket code or Team code required"),
  location: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isStaff(session)) {
      return apiError("Unauthorized: Volunteer or Admin role required for check-in scanning", 403);
    }

    const body = await req.json();
    const { ticketCode, location } = scanCheckinSchema.parse(body);

    // Resolve Ticket by code or team code
    const ticket = await db.ticket.findFirst({
      where: {
        OR: [{ ticket_code: ticketCode.trim() }, { team: { team_code: ticketCode.trim().toUpperCase() } }],
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
      return apiError(`Invalid Ticket Code: "${ticketCode}". No active ticket registered.`, 404);
    }

    const team = ticket.team;

    // Check payment status
    if (!team.payment || team.payment.status !== "VERIFIED") {
      return apiError(
        `Check-in Rejected: Payment for Team ${team.team_name} (${team.team_code}) is NOT verified. Status: ${team.payment?.status || "NOT_SUBMITTED"}`,
        400
      );
    }

    // Check duplicate check-in
    if (team.checkin) {
      return apiResponse(
        false,
        {
          alreadyCheckedIn: true,
          team: {
            id: team.id,
            team_code: team.team_code,
            team_name: team.team_name,
            members: team.members.map((m) => m.participant.name),
            room: team.room_allocation?.room.room_name || "Unassigned",
          },
          checkinDetails: {
            checked_in_at: team.checkin.checked_in_at,
            checked_in_by: team.checkin.checked_in_by,
            location: team.checkin.location,
          },
        },
        `⚠ ALREADY CHECKED IN at ${new Date(team.checkin.checked_in_at).toLocaleTimeString()} by ${team.checkin.checked_in_by}`,
        200
      );
    }

    // Create Check-in record
    const checkin = await db.checkIn.create({
      data: {
        team_id: team.id,
        ticket_id: ticket.id,
        checked_in_by: session!.name || session!.email,
        location: location || "Main Event Desk",
      },
    });

    // Mark ticket as USED
    await db.ticket.update({
      where: { id: ticket.id },
      data: { status: "USED" },
    });

    // Audit Log
    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: "TEAM_CHECKED_IN",
      entity: "CheckIn",
      entityId: checkin.id,
      details: `Team ${team.team_name} (${team.team_code}) checked in successfully at ${checkin.location}.`,
    });

    return apiResponse(
      true,
      {
        alreadyCheckedIn: false,
        checkin,
        team: {
          id: team.id,
          team_code: team.team_code,
          team_name: team.team_name,
          members: team.members.map((m) => m.participant.name),
          room: team.room_allocation?.room.room_name || "Unassigned",
        },
      },
      `✓ CHECK-IN SUCCESSFUL for Team ${team.team_name} (${team.team_code})!`
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Check-in processing error", 500);
  }
}
