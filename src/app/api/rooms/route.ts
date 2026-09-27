import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const createRoomSchema = z.object({
  roomName: z.string().min(1, "Room name required"),
  building: z.string().min(1, "Building name required"),
  floor: z.string().min(1, "Floor required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const rooms = await db.room.findMany({
      include: {
        allocations: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: { room_name: "asc" },
    });

    return apiResponse(true, rooms);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch rooms", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const validated = createRoomSchema.parse(body);

    const existingRoom = await db.room.findUnique({
      where: { room_name: validated.roomName.trim() },
    });

    if (existingRoom) {
      return apiError(`Room "${validated.roomName}" already exists`, 400);
    }

    const room = await db.room.create({
      data: {
        room_name: validated.roomName.trim(),
        building: validated.building.trim(),
        floor: validated.floor.trim(),
        capacity: validated.capacity,
        description: validated.description || null,
      },
    });

    return apiResponse(true, room, `Room ${room.room_name} created successfully!`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to create room", 500);
  }
}
