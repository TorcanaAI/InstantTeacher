import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { SUBJECTS } from "@/lib/constants";
import { sunshineAnswerStream } from "@/lib/sunshineVoice";

export const dynamic = "force-dynamic";

/**
 * POST: Generate Sunshine voice response (OpenAI → ElevenLabs). Admin-only for testing.
 * Returns: audio/mpeg stream.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as { role?: Role }).role !== Role.ADMIN) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = (await req.json()) as { subject?: string; question?: string };
    const questionText = (body.question ?? "").trim();
    if (!questionText) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }
    const subject = (body.subject ?? "General").trim();
    if (subject && !SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const audioStream = await sunshineAnswerStream(questionText, subject);
    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sunshine voice failed";
    if (message.includes("not configured") || message.includes("ELEVENLABS") || message.includes("OPENAI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("Sunshine voice error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
