import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { apiError, apiResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) return apiError("Unauthorized", 403);

    const judges = await db.judge.findMany({
      include: {
        user: {
          select: { email: true, is_active: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return apiResponse(true, judges);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
