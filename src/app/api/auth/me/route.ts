import { NextRequest } from "next/server";
import { getFullSessionUser } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getFullSessionUser();
    if (!user) {
      return apiError("Not authenticated", 401);
    }

    return apiResponse(true, {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.participant?.name || user.email,
      participant: user.participant,
      judge: user.judge,
    });
  } catch (error: any) {
    return apiError(error.message || "Session fetch error", 500);
  }
}
