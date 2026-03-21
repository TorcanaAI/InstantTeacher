import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateAssistantSpeech } from "@/lib/sunshineTTS";
import type { AssistantVoice } from "@/lib/sunshineTTS";

export const dynamic = "force-dynamic";

/**
 * POST: Generate speech for Sunshine or Jack (ElevenLabs).
 * Body: { text: string, assistant: "SUNSHINE" | "JACK" }
 * Returns: audio/mpeg
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { text?: string; assistant?: string };
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const assistant = body?.assistant === "JACK" ? "JACK" : "SUNSHINE";

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const audio = await generateAssistantSpeech(text, assistant as AssistantVoice);

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speech failed";
    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("Assistant speak error:", err);
    return NextResponse.json({ error: "Speech failed" }, { status: 500 });
  }
}
