import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SunshineReadingTestClient from "./SunshineReadingTestClient";

export default async function AdminSunshineReadingTestPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    redirect("/");
  }

  const [students, books] = await Promise.all([
    prisma.studentProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, fullName: true },
    }),
    prisma.readingBook.findMany({
      orderBy: [{ yearLevel: "asc" }, { title: "asc" }],
      select: { id: true, title: true, yearLevel: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Test Sunshine Reading</h1>
      <p className="mt-1 text-muted-foreground">
        Start a reading session as admin (no payment). Pick a student and book, then use the full reading UI with PDF, TTS, and comprehension.
      </p>
      <div className="mt-6">
        <SunshineReadingTestClient students={students} books={books} />
      </div>
      <div className="mt-6 flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/sunshine">Back to Sunshine</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/sunshine-test">Voice / Ask test</Link>
        </Button>
      </div>
    </div>
  );
}
