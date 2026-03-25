import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * DELETE: remove a parent account (User + ParentProfile + children cascade).
 * Admin only. Only users with role PARENT may be deleted.
 */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ parentProfileId: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { parentProfileId } = await context.params;
  if (!parentProfileId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const profile = await prisma.parentProfile.findUnique({
    where: { id: parentProfileId },
    include: { user: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  if (profile.user.role !== Role.PARENT) {
    return NextResponse.json(
      { error: "This account cannot be removed from this screen." },
      { status: 403 }
    );
  }

  await prisma.user.delete({ where: { id: profile.userId } });

  return NextResponse.json({ ok: true });
}
