import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * POST: Get a short, calm correction or assistance phrase when student misreads or needs help.
 * Body: { said?: string, expected: string, needHelp?: boolean }
 * Returns: { correction: string, wordToSpeak?: string } for TTS. If wordToSpeak is set, client should play it after correction so they hear the word.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { said?: string; expected?: string; needHelp?: boolean };
    const expected = (body.expected ?? "").trim();
    const said = (body.said ?? "").trim();
    const needHelp = !!body.needHelp;

    if (!expected) {
      return NextResponse.json({ correction: "Let's try that word again.", wordToSpeak: undefined });
    }

    if (needHelp) {
      return NextResponse.json({
        correction: `Would you like help? The word is "${expected}".`,
        wordToSpeak: expected,
      });
    }

    // Calm, supportive correction (Australian-friendly, for Sunshine voice). Offer to say the word so they hear it.
    const phrases = said
      ? [
          `You said "${said}". The word is "${expected}". I'll say it for you.`,
          `Almost! You said "${said}". Try "${expected}". Here it is.`,
        ]
      : [
          `Almost! Try saying "${expected}". I'll say it for you.`,
          `Nearly there. The word is "${expected}". Here it is.`,
          `Have another go at "${expected}". Listen.`,
        ];
    const correction = phrases[Math.floor(Math.random() * phrases.length)];

    return NextResponse.json({ correction, wordToSpeak: expected });
  } catch (err) {
    console.error("Sunshine reading-feedback error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
