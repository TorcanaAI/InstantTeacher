import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const SYSTEM_INSTRUCTIONS = `You are Sunshine, a calm and encouraging reading coach for primary students (Years 1–5).
- Listen to the student reading the passage aloud.
- Encourage them calmly; do not interrupt unless they ask for help.
- If the student struggles with a word, offer gentle help (e.g. sound it out or give the word).
- At the end of the reading, ask 3–5 short comprehension questions about the passage.
- Keep responses brief and age-appropriate. Do not store or record audio.`;

/**
 * GET ?sessionId=xxx
 * Returns the book content and system prompt for this reading session (for OpenAI context).
 * Auth: session must belong to the current user (parent) or user is admin.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const readingSession = await prisma.sunshineReadingSession.findUnique({
      where: { id: sessionId },
      include: {
        readingBook: {
          select: { contentText: true, title: true, pdfUrl: true },
        },
      },
    });
    if (!readingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const isAdmin = (session.user as { role?: Role }).role === Role.ADMIN;
    if (!isAdmin && readingSession.requestedByUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentText = readingSession.readingBook?.contentText ?? "";
    const bookTitle = readingSession.readingBook?.title ?? "Passage";
    const book = readingSession.readingBook;
    // Use session-scoped PDF URL so parents can view in iframe (admin PDF route requires admin)
    const hasStoredOrInternalPdf = book?.pdfUrl && !book.pdfUrl.startsWith("http");
    const origin = new URL(req.url).origin;
    const pdfUrl = hasStoredOrInternalPdf
      ? `${origin}/api/sunshine/reading-pdf?sessionId=${encodeURIComponent(sessionId)}`
      : (book?.pdfUrl ?? null);

    return NextResponse.json({
      systemInstructions: SYSTEM_INSTRUCTIONS,
      bookTitle,
      contentText,
      pdfUrl,
      fullContext: `${SYSTEM_INSTRUCTIONS}\n\nPassage from "${bookTitle}":\n\n${contentText}`,
    });
  } catch (err) {
    console.error("Sunshine reading-context error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
