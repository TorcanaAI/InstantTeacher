"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

function ensureAdmin() {
  return auth().then((session) => {
    if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
      throw new Error("Unauthorized");
    }
    return session;
  });
}

export async function createBook(data: {
  title: string;
  yearLevel: number;
  contentText: string;
  pdfUrl?: string | null;
}) {
  await ensureAdmin();
  const yearLevel = Math.min(5, Math.max(1, Math.floor(data.yearLevel)));
  const pdfUrl = (data.pdfUrl ?? "").trim() || null;
  await prisma.readingBook.create({
    data: {
      title: (data.title ?? "").trim().slice(0, 500),
      yearLevel,
      contentText: (data.contentText ?? "").trim().slice(0, 500_000),
      pdfUrl,
    },
  });
  revalidatePath("/admin/books");
  revalidatePath("/reading");
}

export async function updateBook(
  id: string,
  data: {
    title: string;
    yearLevel: number;
    contentText: string;
    pdfUrl?: string | null;
    clearPdfBytes?: boolean;
  }
) {
  await ensureAdmin();
  const yearLevel = Math.min(5, Math.max(1, Math.floor(data.yearLevel)));
  const pdfUrl = (data.pdfUrl ?? "").trim() || null;
  const updateData: Parameters<typeof prisma.readingBook.update>[0]["data"] = {
    title: (data.title ?? "").trim().slice(0, 500),
    yearLevel,
    contentText: (data.contentText ?? "").trim().slice(0, 500_000),
    pdfUrl,
  };
  if (data.clearPdfBytes) {
    updateData.pdfBytes = null;
  }
  await prisma.readingBook.update({
    where: { id },
    data: updateData,
  });
  revalidatePath("/admin/books");
  revalidatePath("/reading");
}

export async function deleteBook(id: string) {
  await ensureAdmin();
  await prisma.readingBook.delete({ where: { id } });
  revalidatePath("/admin/books");
  revalidatePath("/reading");
}

// Keep under Next.js/Vercel body limit (~4.5MB); serverActions.bodySizeLimit is 4mb
const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4 MB

export async function uploadBookPdf(id: string, file: File) {
  await ensureAdmin();
  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error(`PDF must be under ${MAX_PDF_BYTES / 1024 / 1024} MB`);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  await prisma.readingBook.update({
    where: { id },
    data: {
      pdfBytes: bytes,
      pdfUrl: `/api/admin/books/${id}/pdf`,
    },
  });
  revalidatePath("/admin/books");
  revalidatePath("/reading");
}
