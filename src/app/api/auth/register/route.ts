import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Full name required"),
  phone: z.string().min(10, "Valid phone number required"),
  college: z.string().min(2, "College name required"),
  course: z.string().min(2, "Course name required"),
  year: z.string().min(1, "Academic year required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return apiError("An account with this email already exists", 400);
    }

    const password_hash = await bcrypt.hash(validated.password, 10);

    const user = await db.user.create({
      data: {
        email: validated.email.toLowerCase(),
        password_hash,
        role: "PARTICIPANT",
        participant: {
          create: {
            name: validated.name,
            phone: validated.phone,
            college: validated.college,
            course: validated.course,
            year: validated.year,
          },
        },
      },
      include: {
        participant: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      participantId: user.participant?.id,
      name: user.participant?.name,
    });

    const res = apiResponse(
      true,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.participant?.name,
        },
      },
      "Registration successful! Welcome to VORTEXA."
    );

    res.cookies.set("vortexa_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to register user", 500);
  }
}
