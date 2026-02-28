import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";

/** GET: list all parent registrations with their children (admin only). */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parents = await prisma.parentProfile.findMany({
    include: {
      user: true,
      students: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const list = parents.map((p) => ({
    id: p.id,
    name: (p.fullName || p.user?.name) ?? "—",
    email: p.user?.email ?? "—",
    phone: p.mobile || null,
    children: p.students.map((s) => ({
      id: s.id,
      name: s.fullName,
      yearLevel: s.schoolYear,
    })),
  }));

  return NextResponse.json(list);
}
