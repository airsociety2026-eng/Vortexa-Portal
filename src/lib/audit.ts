import { db } from "./db";

export async function logAuditAction({
  actorId,
  actorEmail,
  action,
  entity,
  entityId,
  details,
}: {
  actorId?: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        actor_id: actorId || null,
        actor_email: actorEmail,
        action,
        entity,
        entity_id: entityId || null,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
