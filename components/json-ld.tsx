// Rend un bloc de données structurées schema.org (JSON-LD) lisible par les
// moteurs de recherche et les moteurs génératifs.
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // On échappe `<` pour empêcher toute rupture de la balise via `</script>`
      // (défense contre une injection si des données dynamiques/DB sont incluses).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
