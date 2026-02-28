/**
 * Seed the Reading Library with the 9 Sunshine books.
 * Run: npx tsx scripts/seed-reading-books.ts
 * Uses placeholder content; paste full text via Admin → Books → Edit.
 */
import { PrismaClient } from "@prisma/client";

const BOOKS: { title: string; yearLevel: number; contentText: string }[] = [
  { title: "Charlotte's Web", yearLevel: 3, contentText: "[Paste content from Charlotte's Web PDF via Admin → Books → Edit]" },
  { title: "Dog Man (Dave Pilkey)", yearLevel: 2, contentText: "[Paste content from Dog Man PDF via Admin → Books → Edit]" },
  { title: "The 13-Storey Treehouse", yearLevel: 3, contentText: "[Paste content from The 13-Storey Treehouse PDF via Admin → Books → Edit]" },
  { title: "The Boy Who Grew Dragons (Extract)", yearLevel: 3, contentText: "[Paste content from The Boy Who Grew Dragons PDF via Admin → Books → Edit]" },
  { title: "Varjak Paw", yearLevel: 4, contentText: "[Paste content from Varjak Paw PDF via Admin → Books → Edit]" },
  { title: "Wonder", yearLevel: 5, contentText: "[Paste content from Wonder PDF via Admin → Books → Edit]" },
  { title: "Harry Potter and the Philosopher's Stone", yearLevel: 4, contentText: "[Paste content from Harry Potter PDF via Admin → Books → Edit]" },
  { title: "The Wild Robot", yearLevel: 4, contentText: "[Paste content from The Wild Robot PDF via Admin → Books → Edit]" },
  { title: "Animalia", yearLevel: 1, contentText: "[Paste content from Animalia PDF via Admin → Books → Edit]" },
];

const prisma = new PrismaClient();

async function main() {
  for (const book of BOOKS) {
    const existing = await prisma.readingBook.findFirst({
      where: { title: book.title },
    });
    if (existing) {
      console.log(`Skip (exists): ${book.title}`);
      continue;
    }
    await prisma.readingBook.create({
      data: {
        title: book.title,
        yearLevel: book.yearLevel,
        contentText: book.contentText,
      },
    });
    console.log(`Added: ${book.title} (Year ${book.yearLevel})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
