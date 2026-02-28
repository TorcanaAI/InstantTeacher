import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateSunshineSpeech } from "@/lib/sunshineTTS";

export const dynamic = "force-dynamic";

/**
 * POST: TTS only. Locked voice — no frontend voice selection.
 * All Sunshine speech goes through this or /api/sunshine/voice (which uses the same TTS).
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const audio = await generateSunshineSpeech(text);

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sunshine speech failed";
    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("Sunshine speak error:", err);
    return NextResponse.json({ error: "Sunshine speech failed" }, { status: 500 });
  }
}
