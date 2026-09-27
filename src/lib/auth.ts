import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET: string = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is missing.");
}
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  participantId?: string;
  name?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("vortexa_session")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
    select: { is_active: true }
  });

  if (!user || !user.is_active) {
    return null;
  }

  return decoded;
}

export async function getFullSessionUser() {
  const session = await getSessionUser();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      participant: {
        include: {
          team_memberships: {
            include: {
              team: true,
            },
          },
        },
      },
      judge: true,
    },
  });

  return user;
}
