import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { createDailyRoom, isDailyConfigured } from "@/lib/daily";

export const dynamic = "force-dynamic";

/** GET: list all video test sessions (admin only). */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.videoTestSession.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sessions);
}

/** POST: create a test session with a Daily room (admin only). */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDailyConfigured()) {
    return NextResponse.json(
      { error: "Daily credentials not configured. Add DAILY_API_KEY and DAILY_DOMAIN." },
      { status: 503 }
    );
  }

  try {
    const room = await createDailyRoom();
    const { title } = await req.json().catch(() => ({}));
    const name = typeof title === "string" && title.trim() ? title.trim() : `Test ${new Date().toISOString()}`;
    const session = await prisma.videoTestSession.create({
      data: { title: name, roomUrl: room.url },
    });
    return NextResponse.json(session);
  } catch (err) {
    console.error("Admin video-test POST error:", err);
    const message = err instanceof Error ? err.message : "Failed to create test session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
