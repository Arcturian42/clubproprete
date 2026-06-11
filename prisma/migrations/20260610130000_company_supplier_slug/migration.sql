-- Slugs SEO pour les fiches sociétés et fournisseurs (URLs lisibles et partageables)
ALTER TABLE "Company" ADD COLUMN "slug" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");
