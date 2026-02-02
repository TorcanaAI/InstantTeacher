import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { createRoom, getAccessToken } from "@/lib/twilio";

/**
 * GET /api/admin/video-test?action=create|token&roomName=...&role=teacher|student
 * Admin-only: create a test room or get a token to join as teacher/student.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const roomName = searchParams.get("roomName");
    const role = searchParams.get("role");

    if (action === "create") {
      const name = `test-${Date.now()}`;
      await createRoom(name);
      return NextResponse.json({ roomName: name });
    }

    if (action === "token" && roomName && (role === "teacher" || role === "student")) {
      const identity = `${role}-test-${Date.now()}`;
      const token = getAccessToken(identity, roomName);
      return NextResponse.json({ token, roomName });
    }

    return NextResponse.json({ error: "Invalid action or params" }, { status: 400 });
  } catch (err) {
    console.error("Admin video-test error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Video test failed" },
      { status: 500 }
    );
  }
}
