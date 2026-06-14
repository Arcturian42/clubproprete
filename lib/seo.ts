// Helpers SEO / AEO / GEO centralisés : URL canonique, données structurées
// (schema.org) réutilisables et constantes d'identité de l'entité.

export const SITE_NAME = "Club Propreté";
export const SITE_DESCRIPTION =
  "La boîte à outils gratuite des professionnels de la propreté : annuaire, emploi, formations, association et sous-traitance privée.";
export const SITE_LINKEDIN = "https://www.linkedin.com/company/club-proprete";

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
    url: baseUrl,
    logo: `${baseUrl}/icon`,
    description: SITE_DESCRIPTION,
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
