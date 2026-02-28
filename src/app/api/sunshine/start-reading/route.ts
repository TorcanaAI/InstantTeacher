import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { studentId: string; bookId?: string };
    const { studentId, bookId } = body;
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const role = (session.user as { role?: Role }).role;
    const isAdmin = role === Role.ADMIN;

    if (!isAdmin) {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        include: { students: true },
      });
      if (!parent) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 403 });
      }
      const student = parent.students.find((s) => s.id === studentId);
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
    } else {
      const studentExists = await prisma.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!studentExists) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
    }

    let readingBookId: string | null = null;
    if (bookId) {
      const book = await prisma.readingBook.findUnique({ where: { id: bookId } });
      if (book) readingBookId = book.id;
    }

    let readingSession: { id: string };

    if (isAdmin) {
      const created = await prisma.sunshineReadingSession.create({
        data: {
          studentId,
          requestedByUserId: session.user.id,
          readingBookId,
          status: "IN_PROGRESS",
          amountCents: 0,
        },
      });
      readingSession = { id: created.id };
    } else {
      const existing = await prisma.sunshineReadingSession.findFirst({
        where: { studentId, requestedByUserId: session.user.id, status: "PAID" },
        orderBy: { createdAt: "asc" },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "No paid reading session available. Purchase one for $10." },
          { status: 402 }
        );
      }
      await prisma.sunshineReadingSession.update({
        where: { id: existing.id },
        data: { status: "IN_PROGRESS", readingBookId: readingBookId ?? undefined },
      });
      readingSession = { id: existing.id };
    }

    return NextResponse.json({ ok: true, sessionId: readingSession.id });
  } catch (err) {
    console.error("Sunshine start-reading error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
