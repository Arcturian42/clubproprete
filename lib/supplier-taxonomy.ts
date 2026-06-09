export const SUPPLIER_TAXONOMY = {
  consommables: {
    label: "Consommables",
    subs: [
      "produits_entretien",
      "produits_desinfectants",
      "papier_essuie_mains_sanitaire",
      "sacs_poubelle",
      "produits_pour_machines",
      "recharges",
      "produits_ecologiques",
      "produits_specialises",
    ],
    offerTypes: false,
  },
  materiel: {
    label: "Matériel",
    subs: [
      "raclettes",
      "balais",
      "franges",
      "seaux",
      "chariots_menage",
      "pulverisateurs",
      "accessoires_vitrerie",
      "linge_textile",
      "microfibres",
      "uniformes_vetements_pro",
    ],
    offerTypes: false,
  },
  machines: {
    label: "Machines",
    subs: [
      "autolaveuses",
      "monobrosses",
      "aspirateurs_pro",
      "injecteurs_extracteurs",
      "nettoyeurs_vapeur",
      "nettoyeurs_haute_pression",
      "machines_industrielles",
    ],
    offerTypes: true,
  },
  logiciels: {
    label: "Logiciels",
    subs: [
      "planning",
      "crm",
      "erp",
      "devis_facturation",
      "rh",
      "pointage",
      "preuve_de_passage",
      "qualite",
      "gestion_agents",
      "logiciel_metier_proprete",
    ],
    offerTypes: false,
  },
} as const;

export type SupplierFamily = keyof typeof SUPPLIER_TAXONOMY;

export const SUPPLIER_FAMILIES = Object.keys(SUPPLIER_TAXONOMY) as SupplierFamily[];

export const OFFER_TYPES = ["vente", "location", "les_deux"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export function isSupplierFamily(value: unknown): value is SupplierFamily {
  return typeof value === "string" && value in SUPPLIER_TAXONOMY;
}

export function isSupplierSubCategory(value: unknown) {
  return (
    typeof value === "string" &&
    SUPPLIER_FAMILIES.some((family) =>
      (SUPPLIER_TAXONOMY[family].subs as readonly string[]).includes(value)
    )
  );
}

export function isOfferType(value: unknown): value is OfferType {
  return typeof value === "string" && (OFFER_TYPES as readonly string[]).includes(value);
}

export function getSupplierFamilyForSubCategory(subCategory?: string | null): SupplierFamily | null {
  if (!subCategory) return null;

  return (
    SUPPLIER_FAMILIES.find((family) =>
      (SUPPLIER_TAXONOMY[family].subs as readonly string[]).includes(subCategory)
    ) ?? null
  );
}

export function getSupplierFamilyLabel(family?: string | null) {
  return isSupplierFamily(family) ? SUPPLIER_TAXONOMY[family].label : "Fournisseur";
}

export function getSupplierSubCategoryLabel(subCategory?: string | null) {
  if (!subCategory) return "Sous-catégorie à préciser";

  return subCategory
    .split("_")
    .map((part) => (part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ");
}

export function getOfferTypeLabel(offerType?: string | null) {
  if (offerType === "vente") return "Achat";
  if (offerType === "location") return "Location";
  if (offerType === "les_deux") return "Achat & location";
  return null;
}
