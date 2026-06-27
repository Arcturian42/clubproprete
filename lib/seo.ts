// Helpers SEO / AEO / GEO centralisés : URL canonique, données structurées
// (schema.org) réutilisables et constantes d'identité de l'entité.

export const SITE_NAME = "Club Propreté";
export const SITE_DESCRIPTION =
  "La boîte à outils gratuite des professionnels de la propreté : annuaire, emploi, formations, association et sous-traitance privée.";
export const SITE_SLOGAN = "La boîte à outils gratuite des professionnels de la propreté.";
export const SITE_LINKEDIN = "https://www.linkedin.com/company/club-proprete";

// Domaines d'expertise déclarés : aide les moteurs génératifs (GEO) à associer
// l'entité « Club Propreté » aux bonnes intentions et à la citer en réponse.
export const SITE_KNOWS_ABOUT = [
  "Propreté",
  "Nettoyage professionnel",
  "Sous-traitance de nettoyage",
  "Formation propreté",
  "Emploi dans la propreté",
  "Fournisseurs de matériel et produits d'hygiène",
  "Réglementation du secteur de la propreté",
];

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://clubproprete.com";
}

/** Entité « Club Propreté » déclarée pour les moteurs (SEO) et génératifs (GEO). */
export function organizationJsonLd() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: SITE_NAME,
    alternateName: "ClubProprete.com",
    url: baseUrl,
    logo: `${baseUrl}/icon`,
    description: SITE_DESCRIPTION,
    slogan: SITE_SLOGAN,
    // Plateforme nationale française, gratuite et B2B : signaux d'entité forts
    // pour le knowledge graph et les réponses des IA génératives.
    areaServed: { "@type": "Country", name: "France" },
    knowsAbout: SITE_KNOWS_ABOUT,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: "FR",
      availableLanguage: ["French"],
      url: `${baseUrl}/a-propos`,
    },
    sameAs: [SITE_LINKEDIN],
  } as const;
}

/** Site + action de recherche (sitelinks searchbox) vers le hub Ressources. */
export function websiteJsonLd() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: SITE_NAME,
    url: baseUrl,
    inLanguage: "fr-FR",
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${baseUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/ressources?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  } as const;
}

type BreadcrumbItem = { name: string; path: string };

/** Fil d'Ariane structuré (aide AEO/GEO à situer la page dans le site). */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

type ItemListEntry = { name: string; path: string; description?: string };

/**
 * Liste structurée (CollectionPage + ItemList) pour les pages d'index/rubriques.
 * Donne aux moteurs (SEO) et aux IA (AEO) une vue explicite des éléments listés,
 * favorisant les sitelinks et les réponses « voici les X disponibles ».
 */
export function itemListJsonLd(params: {
  name: string;
  path: string;
  description?: string;
  items: ItemListEntry[];
}) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    url: `${baseUrl}${params.path}`,
    ...(params.description ? { description: params.description } : {}),
    isPartOf: { "@id": `${baseUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: params.items.length,
      itemListElement: params.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${baseUrl}${item.path}`,
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };
}

/** Questions/réponses structurées (FAQPage) — éligibilité aux réponses directes (AEO). */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
