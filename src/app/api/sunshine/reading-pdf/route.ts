import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * GET ?sessionId=xxx
 * Serves the PDF for the book in this reading session.
 * Auth: session must belong to current user (parent) or user is admin.
 * Used by the reading page iframe so parents can view the PDF without admin access.
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
          select: { id: true, title: true, pdfBytes: true, pdfUrl: true },
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

    const book = readingSession.readingBook;
    if (!book) {
      return NextResponse.json({ error: "No book for this session" }, { status: 404 });
    }

    // Serve stored PDF
    if (book.pdfBytes && book.pdfBytes.length > 0) {
      const buffer = Buffer.from(book.pdfBytes);
      const body = new Uint8Array(buffer);
      const filename = `${(book.title || "book").replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Redirect to external URL if set
    if (book.pdfUrl?.startsWith("http")) {
      return NextResponse.redirect(book.pdfUrl);
    }

    return NextResponse.json(
      { error: "No PDF available for this book" },
      { status: 404 }
    );
  } catch (err) {
    console.error("[sunshine/reading-pdf] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
