import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text";

/**
 * POST: Transcribe audio using ElevenLabs Speech-to-Text.
 * Body: multipart/form-data with "audio" file (webm, wav, mp3, etc.).
 * Returns: { text: string }.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured. Add it in Vercel → Project → Settings → Environment Variables." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("audio");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "audio file required" }, { status: 400 });
    }

    const body = new FormData();
    body.set("file", file);
    body.set("model_id", "scribe_v2");

    const res = await fetch(ELEVENLABS_STT_URL, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body,
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMessage: string;
      try {
        const errJson = JSON.parse(errText) as { detail?: { message?: string }; message?: string };
        errMessage = errJson.detail?.message ?? errJson.message ?? errText.slice(0, 200);
      } catch {
        errMessage = errText.slice(0, 200) || `Transcription failed: ${res.status}`;
      }
      console.error("ElevenLabs STT error:", res.status, errText);
      return NextResponse.json(
        { error: errMessage },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: (data.text ?? "").trim() });
  } catch (err) {
    console.error("Sunshine transcribe error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
