-- AlterTable
ALTER TABLE "Company" ADD COLUMN "latitude" REAL;
ALTER TABLE "Company" ADD COLUMN "longitude" REAL;

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN "deletedAt" DATETIME;
