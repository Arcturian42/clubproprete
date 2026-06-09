-- AlterTable
ALTER TABLE "Article" ADD COLUMN "readTime" TEXT;
ALTER TABLE "Article" ADD COLUMN "tags" TEXT;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Training" ADD COLUMN "phone" TEXT;
ALTER TABLE "Training" ADD COLUMN "recommendedBy" TEXT;
ALTER TABLE "Training" ADD COLUMN "website" TEXT;

-- AlterTable
ALTER TABLE "TrainingOrganization" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "TrainingOrganization" ADD COLUMN "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "deletedAt" DATETIME;
