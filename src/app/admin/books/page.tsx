import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminBooksClient } from "./AdminBooksClient";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const books = await prisma.readingBook.findMany({
    orderBy: [{ yearLevel: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      yearLevel: true,
      contentText: true,
      pdfUrl: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reading Library</h1>
          <p className="text-muted-foreground">Books for Sunshine reading (Year 1–5)</p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">Add Book</Link>
        </Button>
      </div>
      <Card className="mt-6">
        <CardContent className="p-0">
          <AdminBooksClient books={books} />
        </CardContent>
      </Card>
    </div>
  );
}
