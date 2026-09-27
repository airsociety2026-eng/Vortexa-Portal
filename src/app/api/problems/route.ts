import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const problemSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  category: z.string().min(2, "Category is required"),
  difficulty: z.string().default("Medium"),
  rules: z.string().optional(),
  resources: z.string().optional(),
  attachments: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const isAdmin = isAdminOrSuper(session);

    const problems = await db.problemStatement.findMany({
      where: isAdmin ? {} : { is_published: true },
      orderBy: { published_at: "desc" },
    });

    return apiResponse(true, problems);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch problem statements", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const validated = problemSchema.parse(body);

    const problem = await db.problemStatement.create({
      data: {
        title: validated.title,
        description: validated.description,
        category: validated.category,
        difficulty: validated.difficulty,
        rules: validated.rules || null,
        resources: validated.resources || null,
        attachments: validated.attachments || null,
        is_published: true,
        published_at: new Date(),
        created_by: session!.userId,
      },
    });

    return apiResponse(true, problem, "Problem statement published successfully!");
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to create problem statement", 500);
  }
}
