import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookForm } from "../../BookForm";
import { PdfUploadSection } from "../../PdfUploadSection";
import { updateBook } from "../../../actions/books";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminEditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.readingBook.findUnique({
    where: { id },
    select: { id: true, title: true, yearLevel: true, contentText: true, pdfUrl: true },
  });
  if (!book) notFound();

  async function submitEdit(formData: FormData) {
    "use server";
    const pdfUrl = (formData.get("pdfUrl") as string)?.trim() || null;
    // Only clear stored PDF when user sets an external URL (not our /api/... route)
    const clearPdfBytes = !!pdfUrl && pdfUrl !== `/api/admin/books/${id}/pdf`;
    await updateBook(id, {
      title: (formData.get("title") as string) ?? "",
      yearLevel: parseInt((formData.get("yearLevel") as string) ?? "1", 10),
      contentText: (formData.get("contentText") as string) ?? "",
      pdfUrl,
      clearPdfBytes,
    });
    redirect("/admin/books");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Book</CardTitle>
          <p className="text-sm text-muted-foreground">{book.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <PdfUploadSection bookId={id} />
          </div>
          <BookForm
            action={submitEdit}
            initial={{
              title: book.title,
              yearLevel: book.yearLevel,
              contentText: book.contentText,
              pdfUrl: book.pdfUrl,
            }}
          />
          <Button variant="outline" asChild>
            <Link href="/admin/books">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
