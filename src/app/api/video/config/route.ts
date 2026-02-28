/**
 * GET /api/video/config
 * Returns whether Daily is configured (server-only; no API key exposed).
 */
import { NextResponse } from "next/server";
import { isDailyConfigured, getDailyNotConfiguredMessage } from "@/lib/daily";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isDailyConfigured();
  return NextResponse.json({
    configured,
    message: configured ? undefined : getDailyNotConfiguredMessage(),
  });
}
