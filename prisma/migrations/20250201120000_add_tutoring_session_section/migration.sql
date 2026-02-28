-- AlterTable: add TutoringSession.section (NAPLAN | ATAR) for subject flow.
-- Error fixed: "The column TutoringSession.section does not exist in the current database."
ALTER TABLE "TutoringSession" ADD COLUMN "section" TEXT NOT NULL DEFAULT 'NAPLAN';
