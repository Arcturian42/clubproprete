// Génération de slugs lisibles pour les URLs publiques (fiches société, fournisseur).
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Rend un slug unique en suffixant -2, -3… si nécessaire.
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "fiche";
  let candidate = root;
  let suffix = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
