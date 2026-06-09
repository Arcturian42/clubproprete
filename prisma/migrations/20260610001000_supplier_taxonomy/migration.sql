-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN "family" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "subCategory" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "offerType" TEXT;

-- AlterTable
ALTER TABLE "SupplierService" ADD COLUMN "offerType" TEXT;
