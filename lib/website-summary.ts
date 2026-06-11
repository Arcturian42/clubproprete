/**
 * Récupération légère des métadonnées publiques d'un site (titre, description)
 * pour enrichir automatiquement une fiche lors de l'onboarding. Best-effort :
 * toute erreur (site lent, inaccessible, URL invalide) retourne null sans
 * bloquer le parcours.
 */

export type WebsiteSummary = {
  title: string | null;
  description: string | null;
};

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return null;
}

export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchWebsiteSummary(rawUrl: string): Promise<WebsiteSummary | null> {
  const url = normalizeWebsiteUrl(rawUrl);
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ClubProprete-Bot/1.0 (+https://clubproprete.com)" },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    // 200 Ko suffisent largement pour le <head> ; évite de télécharger des pages énormes.
    const html = (await response.text()).slice(0, 200_000);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1] ? decodeEntities(titleMatch[1]) : extractMeta(html, "og:title");
    const description =
      extractMeta(html, "description") || extractMeta(html, "og:description");

    if (!title && !description) return null;
    return { title, description };
  } catch {
    return null;
  }
}
