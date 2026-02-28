import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminBookPdfViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.readingBook.findUnique({
    where: { id },
    select: { id: true, title: true, pdfUrl: true },
  });
  if (!book) notFound();
  if (!book.pdfUrl) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">No PDF for this book.</p>
        <Button asChild variant="outline">
          <Link href="/admin/books">Back to library</Link>
        </Button>
      </div>
    );
  }

  const pdfSrc = book.pdfUrl.startsWith("http")
    ? book.pdfUrl
    : `/api/admin/books/${id}/pdf`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">{book.title} — PDF</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/books">Back to library</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <iframe
            src={pdfSrc}
            title={book.title}
            className="w-full h-[80vh] min-h-[500px] rounded border bg-white"
          />
        </CardContent>
      </Card>
    </div>
  );
}
