import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ROLES, isAdminOrSuper } from "@/lib/rbac";
import { apiError, apiResponse } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) return apiError("Unauthorized", 403);

    const staff = await db.user.findMany({
      where: { role: { in: [ROLES.ADMIN, ROLES.VOLUNTEER, ROLES.JUDGE] } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        participant: { select: { name: true } },
        judge: { select: { name: true } }
      },
      orderBy: { created_at: "desc" }
    });

    const formatted = staff.map(s => ({
      id: s.id,
      email: s.email,
      name: s.name || s.judge?.name || s.participant?.name || s.email,
      role: s.role,
      is_active: s.is_active,
      created_at: s.created_at,
    }));

    return apiResponse(true, formatted);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([ROLES.ADMIN, ROLES.VOLUNTEER, ROLES.JUDGE]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) return apiError("Unauthorized", 403);

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

    const { name, email, password, role } = parsed.data;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return apiError("Email already in use", 400);

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password_hash,
        role,
        is_active: true,
      }
    });

    if (role === ROLES.JUDGE) {
      await db.judge.create({
        data: {
          user_id: newUser.id,
          name,
          expertise: "General",
        }
      });
    }

    return apiResponse(true, { id: newUser.id }, "Staff account created successfully");
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) return apiError("Unauthorized", 403);

    const body = await req.json();
    const { userId, is_active } = body;

    if (!userId || typeof is_active !== "boolean") {
      return apiError("Invalid data", 400);
    }

    if (userId === session?.userId) {
      return apiError("You cannot deactivate your own currently logged-in account", 400);
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return apiError("User not found", 404);

    if (targetUser.role === ROLES.ADMIN && !is_active) {
      const activeAdmins = await db.user.count({
        where: { role: ROLES.ADMIN, is_active: true }
      });

      if (activeAdmins <= 1) {
        return apiError("Cannot deactivate the last active ADMIN account", 400);
      }
    }

    await db.user.update({
      where: { id: userId },
      data: { is_active }
    });

    return apiResponse(true, null, `Account ${is_active ? 'activated' : 'deactivated'} successfully`);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
