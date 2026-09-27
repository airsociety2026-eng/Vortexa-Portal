import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(2, "Title is required"),
  message: z.string().min(5, "Message content is required"),
  priority: z.enum(["NORMAL", "IMPORTANT", "URGENT"]).default("NORMAL"),
  targetAudience: z.string().default("ALL"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const isAdmin = isAdminOrSuper(session);

    const announcements = await db.announcement.findMany({
      where: isAdmin ? {} : { is_published: true },
      orderBy: { published_at: "desc" },
    });

    return apiResponse(true, announcements);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch announcements", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const validated = announcementSchema.parse(body);

    const announcement = await db.announcement.create({
      data: {
        title: validated.title,
        message: validated.message,
        priority: validated.priority,
        target_audience: validated.targetAudience,
        is_published: true,
        published_at: new Date(),
        created_by: session!.userId,
      },
    });

    return apiResponse(true, announcement, "Announcement published successfully!");
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to create announcement", 500);
  }
}
