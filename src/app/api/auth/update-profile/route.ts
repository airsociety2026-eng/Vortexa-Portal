import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Full name required"),
  phone: z.string().min(10, "Valid phone number required"),
  college: z.string().min(2, "College name required"),
  course: z.string().min(2, "Course name required"),
  department: z.string().min(1, "Department required"),
  year: z.string().min(1, "Academic year required"),
  rollNumber: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.participantId) {
      return apiError("Authentication required", 401);
    }

    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    const updatedParticipant = await db.participant.update({
      where: { id: session.participantId },
      data: {
        name: validated.name,
        phone: validated.phone,
        college: validated.college,
        course: validated.course,
        department: validated.department,
        year: validated.year,
        roll_number: validated.rollNumber || null,
      },
    });

    return apiResponse(
      true,
      { participant: updatedParticipant },
      "Profile updated successfully!"
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to update profile", 500);
  }
}
