import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const criteriaSchema = z.object({
  name: z.string().min(2, "Criteria name required"),
  description: z.string().min(5, "Description required"),
  maxScore: z.number().min(1, "Max score must be at least 1"),
  weight: z.number().default(1.0),
});

export async function GET(req: NextRequest) {
  try {
    const criteria = await db.judgingCriteria.findMany({
      orderBy: { name: "asc" },
    });
    return apiResponse(true, criteria);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch criteria", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const validated = criteriaSchema.parse(body);

    const criteria = await db.judgingCriteria.create({
      data: {
        name: validated.name,
        description: validated.description,
        max_score: validated.maxScore,
        weight: validated.weight,
      },
    });

    return apiResponse(true, criteria, "Judging criteria created successfully!");
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to create criteria", 500);
  }
}
