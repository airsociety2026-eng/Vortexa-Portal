import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        participant: true,
      },
    });

    if (!user) {
      return apiError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(validated.password, user.password_hash);
    if (!isValid) {
      return apiError("Invalid credentials", 401);
    }

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
          name: user.participant?.name || user.email,
        },
      },
      "Login successful"
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
    return apiError(error.message || "Failed to log in", 500);
  }
}
