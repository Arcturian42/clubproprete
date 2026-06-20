import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  // Next.js needs unsafe-inline/unsafe-eval in dev for HMR; tighter in prod
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  // img-src (S6) :
  //  - data: / blob: → aperçus locaux des fichiers AVANT upload (les composants
  //    d'upload affichent un <img> sur un URL.createObjectURL/dataURL). Nécessaire
  //    pour l'UX d'upload (avatar, logo, photos). Aucun vecteur XSS identifié,
  //    mais blob: élargit légèrement la surface : à retirer si la prévisualisation
  //    locale est supprimée.
  //  - Vercel Blob (photos/documents uploadés) + tuiles OpenStreetMap de la carte.
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  // recherche-entreprises.api.gouv.fr : autocomplétion SIRET de l'onboarding
  "connect-src 'self' https://recherche-entreprises.api.gouv.fr",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    // next/image proxifie et optimise les images distantes via /_next/image
    // (same-origin → conforme à la CSP `img-src 'self'`). On autorise tout hôte
    // HTTPS car les sources sont variées : Vercel Blob (uploads), avatars Google
    // (lh3.googleusercontent.com), logos/visuels saisis. Le proxy same-origin
    // évite d'avoir à élargir la CSP image.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    const headers = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: csp },
    ];
    if (isProd) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/(.*)", headers }];
  },
  async redirects() {
    return [
      // La rubrique « média » est désormais le blog : on consolide les anciennes
      // landing pages média vers /ressources (catégories du blog).
      { source: "/ressources/media", destination: "/ressources", permanent: true },
      { source: "/ressources/media/:slug", destination: "/ressources", permanent: true },
      { source: "/societes", destination: "/annuaire/societes", permanent: true },
      { source: "/fournisseurs", destination: "/annuaire/fournisseurs", permanent: true },
      { source: "/centres-formation", destination: "/annuaire/centres-formation", permanent: true },
    ];
  },
};

export default nextConfig;
