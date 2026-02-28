import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";

/** Escape a CSV field (quote if contains comma, newline, or quote). */
function csvEscape(value: string): string {
  const s = String(value ?? "").trim();
  if (/[,"\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** GET: export parents + children as CSV (admin only). */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const parents = await prisma.parentProfile.findMany({
    include: {
      user: true,
      students: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: string[][] = [
    ["Parent Name", "Parent Email", "Mobile", "Child Name", "Year Level", "School"],
  ];

  for (const p of parents) {
    const parentName = csvEscape(p.fullName);
    const parentEmail = csvEscape(p.user?.email ?? "");
    const mobile = csvEscape(p.mobile);

    if (p.students.length === 0) {
      rows.push([parentName, parentEmail, mobile, "", "", ""]);
    } else {
      for (const s of p.students) {
        rows.push([
          parentName,
          parentEmail,
          mobile,
          csvEscape(s.fullName),
          String(s.schoolYear),
          csvEscape(s.schoolName),
        ]);
      }
    }
  }

  const csv = rows.map((r) => r.join(",")).join("\n");
  const bom = "\uFEFF";

  return new Response(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="parents.csv"',
    },
  });
}
