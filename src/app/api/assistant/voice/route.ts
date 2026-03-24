import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { SUBJECTS } from "@/lib/constants";
import { jackAnswerStream, sunshineAnswerStream } from "@/lib/sunshineVoice";

export const dynamic = "force-dynamic";

/**
 * POST: OpenAI answer + ElevenLabs (Sunshine or Jack). Admin-only for testing.
 * Body: { question: string, subject?: string, imageUrl?: string, assistant?: "SUNSHINE" | "JACK" }
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

    const body = (await req.json()) as {
      subject?: string;
      question?: string;
      imageUrl?: string;
      assistant?: string;
    };
    const questionText = (body.question ?? "").trim();
    if (!questionText) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }
    const subject = (body.subject ?? "English").trim();
    if (subject && !SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const assistant = body.assistant === "JACK" ? "JACK" : "SUNSHINE";
    const imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : undefined;

    const audioStream =
      assistant === "JACK"
        ? await jackAnswerStream(questionText, subject, imageUrl)
        : await sunshineAnswerStream(questionText, subject, imageUrl);

    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assistant voice failed";
    if (
      message.includes("not configured") ||
      message.includes("ELEVENLABS") ||
      message.includes("OPENAI")
    ) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("Assistant voice error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
