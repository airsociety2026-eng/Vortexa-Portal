import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTeamCode(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 digits
  return `VTX26-${randomDigits}`;
}

export function generateTicketCode(): string {
  const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `VTX-TICK-${randomHex}`;
}

export function generateCertificateCode(): string {
  const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `VTX-CERT-${randomHex}`;
}

export function apiResponse<T>(success: boolean, data?: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success,
      data: data ?? null,
      message: message ?? (success ? "Operation successful" : "An error occurred"),
    },
    { status }
  );
}

export function apiError(message: string, status = 400, code = "BAD_REQUEST") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
