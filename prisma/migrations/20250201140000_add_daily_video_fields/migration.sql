-- Add Daily.co video fields to TutoringSession
ALTER TABLE "TutoringSession" ADD COLUMN "dailyRoomName" TEXT;
ALTER TABLE "TutoringSession" ADD COLUMN "dailyRoomUrl" TEXT;
ALTER TABLE "TutoringSession" ADD COLUMN "videoProvider" TEXT DEFAULT 'DAILY';
