/**
 * EMERGENCY admin bootstrap: creates/repairs admin user.
 * Allowed: NODE_ENV !== "production" OR header x-admin-bootstrap-secret === ADMIN_BOOTSTRAP_SECRET.
 * Creates/repairs: support@torcanaai.com, role ADMIN, passwordHash = bcrypt("SouthAfrica91!", 12).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const ADMIN_EMAIL = "support@torcanaai.com";
const ADMIN_PASSWORD = "SouthAfrica91!";
const BCRYPT_ROUNDS = 12;

function isAllowed(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const secret = request.headers.get("x-admin-bootstrap-secret");
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET;
  return Boolean(expected && secret === expected);
}

export async function POST(request: Request) {
  if (!isAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

    let existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });
    if (!existing) {
      existing = await prisma.user.findFirst({
        where: { email: { equals: ADMIN_EMAIL, mode: "insensitive" } },
      });
    }

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { email: ADMIN_EMAIL, role: Role.ADMIN, passwordHash },
      });
      console.log("Admin user updated:", ADMIN_EMAIL);
      return NextResponse.json({ ok: true, message: "Admin user updated" });
    }

    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: "InstantTeacher Admin",
        role: Role.ADMIN,
      },
    });
    console.log("Admin user created:", ADMIN_EMAIL);
    return NextResponse.json({ ok: true, message: "Admin user created" });
  } catch (e) {
    console.error("Bootstrap error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bootstrap failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!isAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return POST(request);
}
