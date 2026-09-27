import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const allocateSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { teamId, roomId } = allocateSchema.parse(body);

    const team = await db.team.findUnique({
      where: { id: teamId },
    });
    if (!team) return apiError("Team not found", 404);

    const roomForName = await db.room.findUnique({ where: { id: roomId } });
    if (!roomForName) return apiError("Room not found", 404);
    let allocation;
    try {
      allocation = await db.$transaction(async (tx) => {
        const room = await tx.room.findUnique({
          where: { id: roomId },
          include: { _count: { select: { allocations: true } } },
        });
        if (!room) throw new Error("Room not found");

        const existingAlloc = await tx.roomAllocation.findUnique({ where: { team_id: teamId } });
        const isAlreadyInThisRoom = existingAlloc?.room_id === roomId;

        if (!isAlreadyInThisRoom && room._count.allocations >= room.capacity) {
          throw new Error(`Room ${room.room_name} capacity (${room.capacity} teams) has been reached`);
        }

        return await tx.roomAllocation.upsert({
          where: { team_id: teamId },
          update: {
            room_id: roomId,
            allocated_by: session!.name || session!.email,
            allocated_at: new Date(),
          },
          create: {
            team_id: teamId,
            room_id: roomId,
            allocated_by: session!.name || session!.email,
          },
          include: {
            room: true,
            team: true,
          },
        });
      });
    } catch (err: any) {
      return apiError(err.message || "Capacity check failed", 400);
    }
    const room = roomForName;

    // Notify Team Leader
    const leaderMembership = await db.teamMember.findFirst({
      where: { team_id: teamId, role: "LEADER" },
      include: { participant: true },
    });

    if (leaderMembership) {
      await db.notification.create({
        data: {
          user_id: leaderMembership.participant.user_id,
          title: "📍 Room Allocated!",
          message: `Team ${team.team_name} has been allocated to Room ${room.room_name} (${room.building}, ${room.floor}).`,
          type: "INFO",
        },
      });
    }

    // Audit Log
    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: "ROOM_ASSIGNED",
      entity: "RoomAllocation",
      entityId: allocation.id,
      details: `Assigned Team ${team.team_code} to Room ${room.room_name}.`,
    });

    return apiResponse(true, allocation, `Team ${team.team_code} allocated to Room ${room.room_name}`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to allocate room", 500);
  }
}
