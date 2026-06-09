import { PrismaClient } from "@prisma/client";
import { getSupplierFamilyForSubCategory, isSupplierSubCategory } from "../lib/supplier-taxonomy";
import type { OfferType, SupplierFamily } from "../lib/supplier-taxonomy";

const prisma = new PrismaClient();

type SupplierTaxonomyMatch = {
  family: SupplierFamily;
  subCategory: string;
  offerType: OfferType | null;
};

const supplierMatches: Record<string, SupplierTaxonomyMatch> = {
  "produits d'entretien ecologiques": {
    family: "consommables",
    subCategory: "produits_ecologiques",
    offerType: null,
  },
  "produits d'entretien écologiques": {
    family: "consommables",
    subCategory: "produits_ecologiques",
    offerType: null,
  },
  "equipements de protection individuelle": {
    family: "materiel",
    subCategory: "uniformes_vetements_pro",
    offerType: null,
  },
  "équipements de protection individuelle": {
    family: "materiel",
    subCategory: "uniformes_vetements_pro",
    offerType: null,
  },
  "materiel et machines de nettoyage": {
    family: "machines",
    subCategory: "autolaveuses",
    offerType: "les_deux",
  },
  "matériel et machines de nettoyage": {
    family: "machines",
    subCategory: "autolaveuses",
    offerType: "les_deux",
  },
  "linge et textile": {
    family: "materiel",
    subCategory: "linge_textile",
    offerType: null,
  },
  "services aux entreprises": {
    family: "logiciels",
    subCategory: "logiciel_metier_proprete",
    offerType: null,
  },
};

const serviceMatches: Record<string, { category: string; offerType: OfferType | null }> = {
  produits: { category: "produits_ecologiques", offerType: null },
  epi: { category: "uniformes_vetements_pro", offerType: null },
  machines: { category: "autolaveuses", offerType: "location" },
  textile: { category: "linge_textile", offerType: null },
  services: { category: "logiciel_metier_proprete", offerType: null },
};

function normalize(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeOfferType(offerType?: string | null): OfferType | null {
  return offerType === "vente" || offerType === "location" || offerType === "les_deux"
    ? offerType
    : null;
}

function resolveSupplierTaxonomy(
  category: string,
  name: string,
  currentOfferType?: string | null
): SupplierTaxonomyMatch {
  const normalizedCategory = normalize(category);
  const normalizedName = normalize(name);

  const existingFamily = getSupplierFamilyForSubCategory(category);
  if (existingFamily && isSupplierSubCategory(category)) {
    return {
      family: existingFamily,
      subCategory: category,
      offerType: existingFamily === "machines" ? normalizeOfferType(currentOfferType) ?? "les_deux" : null,
    };
  }

  const directMatch = supplierMatches[normalizedCategory];
  if (directMatch) return directMatch;

  if (normalizedName.includes("machine") || normalizedCategory.includes("machine")) {
    return { family: "machines", subCategory: "autolaveuses", offerType: "les_deux" };
  }

  if (normalizedName.includes("textile") || normalizedCategory.includes("linge")) {
    return { family: "materiel", subCategory: "linge_textile", offerType: null };
  }

  if (normalizedName.includes("logiciel") || normalizedCategory.includes("logiciel")) {
    return { family: "logiciels", subCategory: "logiciel_metier_proprete", offerType: null };
  }

  return { family: "consommables", subCategory: "produits_entretien", offerType: null };
}

function resolveServiceTaxonomy(category: string, currentOfferType?: string | null) {
  const normalizedCategory = normalize(category);
  const directMatch = serviceMatches[normalizedCategory];
  if (directMatch) return directMatch;

  if (isSupplierSubCategory(category)) {
    const family = getSupplierFamilyForSubCategory(category);
    return {
      category,
      offerType: family === "machines" ? normalizeOfferType(currentOfferType) ?? "location" : null,
    };
  }

  return { category: "produits_entretien", offerType: null };
}

async function main() {
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, category: true, offerType: true },
  });

  for (const supplier of suppliers) {
    const taxonomy = resolveSupplierTaxonomy(supplier.category, supplier.name, supplier.offerType);
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        category: taxonomy.subCategory,
        family: taxonomy.family,
        subCategory: taxonomy.subCategory,
        offerType: taxonomy.offerType,
      },
    });
  }

  const services = await prisma.supplierService.findMany({
    select: { id: true, category: true, offerType: true },
  });

  for (const service of services) {
    const taxonomy = resolveServiceTaxonomy(service.category, service.offerType);
    await prisma.supplierService.update({
      where: { id: service.id },
      data: {
        category: taxonomy.category,
        offerType: taxonomy.offerType,
      },
    });
  }

  console.log(`Backfilled ${suppliers.length} suppliers and ${services.length} supplier services.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
