-- AlterTable
ALTER TABLE "Company" ADD COLUMN "photos" TEXT;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN "internalNotes" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "photos" TEXT;
