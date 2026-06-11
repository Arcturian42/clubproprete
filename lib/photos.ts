/**
 * Désérialise la liste de photos stockée en JSON (User.photos, Company.photos).
 * Retourne toujours un tableau exploitable, même si la valeur est absente ou corrompue.
 */
export function parsePhotos(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
}
