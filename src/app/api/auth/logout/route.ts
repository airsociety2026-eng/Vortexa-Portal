import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const res = apiResponse(true, null, "Logged out successfully");
  res.cookies.set("vortexa_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return res;
}
