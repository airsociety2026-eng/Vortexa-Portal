import { JWTPayload } from "./auth";

export const ROLES = {
  PARTICIPANT: "PARTICIPANT",
  TEAM_LEADER: "TEAM_LEADER",
  VOLUNTEER: "VOLUNTEER",
  JUDGE: "JUDGE",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = keyof typeof ROLES;

export function hasRole(session: JWTPayload | null, allowedRoles: string[]): boolean {
  if (!session) return false;
  // SUPER_ADMIN has master override for administrative routes
  if (session.role === ROLES.SUPER_ADMIN) return true;
  return allowedRoles.includes(session.role);
}

export function isAdminOrSuper(session: JWTPayload | null): boolean {
  return hasRole(session, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
}

export function isStaff(session: JWTPayload | null): boolean {
  return hasRole(session, [ROLES.VOLUNTEER, ROLES.JUDGE, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
}
