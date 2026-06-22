-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('WSM', 'GM_DECISION', 'AD_HOC');

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "type" "MeetingType" NOT NULL DEFAULT 'WSM';
