import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST: Generate 3–5 comprehension questions from the session's book content.
 * Body: { sessionId: string }
 * Returns: { questions: { question: string; options?: string[] }[] }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { sessionId: string };
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const readingSession = await prisma.sunshineReadingSession.findUnique({
      where: { id: sessionId },
      include: { readingBook: true },
    });
    if (!readingSession || readingSession.requestedByUserId !== session.user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const contentText = readingSession.readingBook?.contentText ?? "";
    const bookTitle = readingSession.readingBook?.title ?? "the passage";
    if (!contentText) {
      return NextResponse.json({ error: "No book content" }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 503 }
      );
    }

    const truncated = contentText.slice(0, 12000);

    const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Sunshine, a calm reading coach. Generate exactly 4 short comprehension questions about the given passage. Each question should be suitable for primary students (Years 1–5). Return a JSON object with a single key "questions" whose value is an array of objects with "question" (string) and "options" (array of 2–4 possible answers). Example: {"questions":[{"question":"What did the character do first?","options":["Went to the shop","Woke up","Ate breakfast"]}]}`,
          },
          {
            role: "user",
            content: `Passage from "${bookTitle}":\n\n${truncated}\n\nReturn only the JSON object, no other text.`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!completionRes.ok) {
      const err = await completionRes.text();
      throw new Error(`OpenAI error: ${completionRes.status} ${err}`);
    }

    const completion = (await completionRes.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    let parsed: { questions?: { question: string; options?: string[] }[] };
    try {
      parsed = JSON.parse(raw) as { questions?: { question: string; options?: string[] }[] };
    } catch {
      parsed = {};
    }
    const questions = parsed.questions ?? (Array.isArray(parsed) ? parsed : []);

    return NextResponse.json({
      questions: questions.slice(0, 5).map((q) => ({
        question: typeof q === "object" && q?.question ? q.question : String(q),
        options: Array.isArray((q as { options?: string[] }).options) ? (q as { options: string[] }).options : undefined,
      })),
    });
  } catch (err) {
    console.error("Sunshine comprehension-questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
