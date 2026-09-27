import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const settingsSchema = z.object({
  eventName: z.string().min(1),
  eventYear: z.string().min(1),
  registrationOpen: z.boolean(),
  registrationClose: z.boolean(),
  paymentAmount: z.number().min(0),
  upiId: z.string().min(1),
  upiQrUrl: z.string().optional(),
  venue: z.string().min(1),
  officialEmail: z.string().email(),
});

export async function GET(req: NextRequest) {
  try {
    const settings = await db.eventSettings.findFirst();
    return apiResponse(true, settings);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch event settings", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const validated = settingsSchema.parse(body);

    const existing = await db.eventSettings.findFirst();

    const updated = await db.eventSettings.upsert({
      where: { id: existing?.id || "default-settings-id" },
      update: {
        event_name: validated.eventName,
        event_year: validated.eventYear,
        registration_open: validated.registrationOpen,
        registration_close: validated.registrationClose,
        payment_amount: validated.paymentAmount,
        upi_id: validated.upiId,
        upi_qr_url: validated.upiQrUrl || "",
        venue: validated.venue,
        official_email: validated.officialEmail,
      },
      create: {
        event_name: validated.eventName,
        event_year: validated.eventYear,
        registration_open: validated.registrationOpen,
        registration_close: validated.registrationClose,
        payment_amount: validated.paymentAmount,
        upi_id: validated.upiId,
        upi_qr_url: validated.upiQrUrl || "",
        venue: validated.venue,
        official_email: validated.officialEmail,
      },
    });

    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: "EVENT_SETTINGS_UPDATED",
      entity: "EventSettings",
      details: `Updated event settings: ${validated.eventName}, Fee: ₹${validated.paymentAmount}`,
    });

    return apiResponse(true, updated, "Event settings saved successfully!");
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to update settings", 500);
  }
}
