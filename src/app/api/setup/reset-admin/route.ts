/**
 * Reset admin user ON THE SERVER (same DB as login). Call this from production
 * so we're 100% writing to the database that /api/auth uses.
 *
 * In Vercel: add env var RESET_ADMIN_TOKEN (e.g. "my-secret-reset").
 * Then visit: GET https://your-app.vercel.app/api/setup/reset-admin?token=my-secret-reset
 * Admin will be: support@torcanaai.com / SouthAfrica91!
 * Then remove RESET_ADMIN_TOKEN from Vercel and log in.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const ADMIN_EMAIL = "support@torcanaai.com";
const TEMP_PASSWORD = "SouthAfrica91!";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const expected = process.env.RESET_ADMIN_TOKEN ?? "InstantTeacherReset2024";

  if (!token || token !== expected) {
    return NextResponse.json(
      { error: "Invalid token. Use ?token=InstantTeacherReset2024 or set RESET_ADMIN_TOKEN in Vercel." },
      { status: 401 }
    );
  }

  try {
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10);

    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN, passwordHash },
      });
    } else {
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash,
          name: "InstantTeacher Admin",
          role: Role.ADMIN,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Admin reset on this server's database.",
      email: ADMIN_EMAIL,
      password: TEMP_PASSWORD,
      hint: "Log in at /login, then remove RESET_ADMIN_TOKEN from Vercel.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reset failed";
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("reset-admin error:", e);
    return NextResponse.json(
      { error: message, ...(process.env.NODE_ENV === "development" && { stack }) },
      { status: 500 }
    );
  }
}
