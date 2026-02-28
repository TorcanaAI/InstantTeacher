import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { ReadingClient } from "./ReadingClient";

export const dynamic = "force-dynamic";

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; bookId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { studentId, bookId } = await searchParams;
  if (!studentId) {
    redirect("/parent/dashboard");
  }

  const role = (session.user as { role?: Role }).role;
  const isAdmin = role === Role.ADMIN;

  const parent = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { students: true },
  });
  if (!parent) {
    redirect("/parent/dashboard");
  }
  const student = parent.students.find((s) => s.id === studentId);
  if (!student && !isAdmin) {
    redirect("/parent/dashboard");
  }

  const books = await prisma.readingBook.findMany({
    orderBy: [{ yearLevel: "asc" }, { title: "asc" }],
    select: { id: true, title: true, yearLevel: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-slate-50">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800">Explore Reading with Sunshine</h1>
        <p className="mt-1 text-muted-foreground">
          Select your year level, choose your book, and start reading.
        </p>
        <ReadingClient
        books={books}
        studentId={studentId}
        initialBookId={bookId ?? null}
        isAdmin={isAdmin}
      />
      </div>
    </div>
  );
}
