import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const logs = await db.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return apiResponse(true, logs);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch audit logs", 500);
  }
}
