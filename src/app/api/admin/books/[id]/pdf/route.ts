import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel request body limit)

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const book = await prisma.readingBook.findUnique({
    where: { id },
    select: { pdfBytes: true, pdfUrl: true, title: true },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Serve stored PDF (Uint8Array for broad compatibility)
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
}

export const maxDuration = 60;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await handlePdfUpload(req, context);
  } catch (e) {
    console.error("[admin/books/pdf] unexpected error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed. Try a smaller PDF or use PDF URL." },
      { status: 500 }
    );
  }
}

async function handlePdfUpload(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/books/pdf] requireAdmin error:", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await params;
  const id = resolved.id;

  let book: { id: string } | null = null;
  try {
    book = await prisma.readingBook.findUnique({
      where: { id },
      select: { id: true },
    });
  } catch (e) {
    console.error("[admin/books/pdf] findUnique error:", e);
    return NextResponse.json(
      { error: "Database error. Check DATABASE_URL and that the book exists." },
      { status: 500 }
    );
  }

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (e) {
    console.error("[admin/books/pdf] formData error:", e);
    return NextResponse.json(
      { error: "Invalid form data. If the file is large, try a PDF under 4 MB or use PDF URL instead." },
      { status: 400 }
    );
  }

  const file = formData.get("file") ?? formData.get("pdf");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Use form field 'file' or 'pdf'." },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "File must be a PDF (application/pdf)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: `PDF must be under ${MAX_PDF_BYTES / 1024 / 1024} MB` },
      { status: 400 }
    );
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch (e) {
    console.error("[admin/books/pdf] arrayBuffer error:", e);
    return NextResponse.json(
      { error: "Failed to read file. Try a smaller PDF or use PDF URL." },
      { status: 400 }
    );
  }

  const pdfUrl = `/api/admin/books/${id}/pdf`;

  async function doUpdate() {
    await prisma.readingBook.update({
      where: { id },
      data: { pdfBytes: bytes, pdfUrl },
    });
  }

  try {
    await doUpdate();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const missingColumn =
      /pdfBytes|column.*does not exist|does not exist/i.test(msg) ||
      (msg.includes("column") && msg.includes("exist"));
    if (missingColumn) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "ReadingBook" ADD COLUMN IF NOT EXISTS "pdfBytes" BYTEA`
        );
        await doUpdate();
      } catch (retryErr) {
        console.error("[admin/books/pdf] retry after add column:", retryErr);
        return NextResponse.json(
          { error: "Failed to save PDF after adding column. Try again or run: npx prisma db push" },
          { status: 500 }
        );
      }
    } else {
      console.error("[admin/books/pdf] update error:", e);
      return NextResponse.json(
        { error: "Failed to save PDF. Try a smaller file or use PDF URL." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
