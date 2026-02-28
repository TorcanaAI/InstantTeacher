/**
 * Load PDFs from "Sunshine books" folder into the Reading Library.
 * Run from project root with DATABASE_URL in .env:
 *   npx tsx scripts/load-sunshine-pdfs.ts
 *
 * Or with explicit path and DB:
 *   PDF_DIR="C:\\Users\\justin\\Desktop\\Sunshine books" npx tsx scripts/load-sunshine-pdfs.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { join } from "path";

const PDF_DIR = process.env.PDF_DIR ?? join(process.env.USERPROFILE ?? "", "Desktop", "Sunshine books");

// Filename (as you have it) -> exact ReadingBook title in DB (from seed)
const FILE_TO_TITLE: Record<string, string> = {
  "Animalia.pdf": "Animalia",
  "Charlottes Web.pdf": "Charlotte's Web",
  "Dog Man by Dave Pilkey.pdf": "Dog Man (Dave Pilkey)",
  "Harry Potter and the Philosopher Stone.pdf": "Harry Potter and the Philosopher's Stone",
  "The 13-Storey Treehouse.pdf": "The 13-Storey Treehouse",
  "The Boy Who Grew Dragons Extract.pdf": "The Boy Who Grew Dragons (Extract)",
  "The Wild Robot.pdf": "The Wild Robot",
  "Varjak-Paw.pdf": "Varjak Paw",
  "Wonder.pdf": "Wonder",
};

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB (direct DB write; API view still has limits)

const prisma = new PrismaClient();

async function main() {
  console.log("PDF directory:", PDF_DIR);
  console.log("");

  for (const [filename, title] of Object.entries(FILE_TO_TITLE)) {
    const filePath = join(PDF_DIR, filename);
    let buf: Buffer;
    try {
      buf = await readFile(filePath);
    } catch (e) {
      console.error(`SKIP ${filename}: file not found or unreadable (${e instanceof Error ? e.message : e})`);
      continue;
    }

    if (buf.length > MAX_PDF_BYTES) {
      console.error(`SKIP ${filename}: too large (${(buf.length / 1024 / 1024).toFixed(2)} MB, max 4 MB)`);
      continue;
    }

    const book = await prisma.readingBook.findFirst({
      where: { title },
      select: { id: true, title: true },
    });
    if (!book) {
      console.error(`SKIP ${filename}: no book in DB with title "${title}". Run seed-reading-books first.`);
      continue;
    }

    await prisma.readingBook.update({
      where: { id: book.id },
      data: {
        pdfBytes: buf,
        pdfUrl: `/api/admin/books/${book.id}/pdf`,
      },
    });
    console.log(`OK: ${filename} -> "${book.title}" (${(buf.length / 1024).toFixed(1)} KB)`);
  }

  console.log("");
  console.log("Done. Check Admin → Books → View PDF for each book.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
