import { headers } from "next/headers";

/**
 * Résout l'IP cliente pour les clés de limitation de débit.
 *
 * Sécurité (S1) : `x-forwarded-for` est trivialement falsifiable par le client
 * (`curl -H "x-forwarded-for: 1.2.3.4"`). N'importe qui pourrait alors contourner
 * les limites par IP ou épuiser le quota d'une IP arbitraire. On ne fait donc
 * confiance qu'aux en-têtes positionnés par le proxy de confiance (le réseau Edge
 * de Vercel), qui écrasent toute valeur fournie par le client :
 *   - `x-vercel-forwarded-for` : IP réelle vue par l'Edge Vercel ;
 *   - `x-real-ip` : également renseigné par l'infrastructure Vercel.
 *
 * `x-forwarded-for` n'est utilisé qu'en dehors de la production (dev local /
 * tests), où aucun proxy de confiance n'est présent et où l'usurpation n'a pas
 * d'impact de sécurité.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();

  // En-têtes de confiance, renseignés par l'infrastructure Vercel.
  const trusted = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip");
  if (trusted) {
    return trusted.split(",")[0]?.trim() || "unknown";
  }

  // Repli pour le développement local uniquement : NE JAMAIS faire confiance à
  // `x-forwarded-for` en production (il est contrôlé par le client).
  if (process.env.NODE_ENV !== "production") {
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }
  }

  return "unknown";
}
