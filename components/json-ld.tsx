// Rend un bloc de données structurées schema.org (JSON-LD) lisible par les
// moteurs de recherche et les moteurs génératifs.
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Le contenu est généré côté serveur à partir de nos données : pas de saisie utilisateur brute.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
