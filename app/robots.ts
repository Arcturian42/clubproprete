import type { MetadataRoute } from "next";

// Sections privées / transactionnelles à exclure de tous les robots.
const DISALLOW = ["/admin", "/dashboard", "/profil", "/connexion", "/inscription", "/api/"];

// Crawlers des moteurs génératifs (GEO) : on les autorise EXPLICITEMENT afin que
// Club Propreté reste citable dans les réponses de ChatGPT, Claude, Perplexity,
// Gemini, etc. Ce choix est intentionnel — ne pas restreindre sans décision GEO.
const AI_CRAWLERS = [
  "GPTBot", // OpenAI / ChatGPT
  "OAI-SearchBot", // OpenAI Search
  "ChatGPT-User", // navigation à la demande ChatGPT
  "ClaudeBot", // Anthropic / Claude
  "Claude-Web",
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Google-Extended", // entraînement / Gemini (indépendant de Googlebot)
  "Applebot-Extended", // Apple Intelligence
  "CCBot", // Common Crawl (alimente de nombreux LLM)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // Même périmètre que les robots classiques : pages publiques ouvertes,
      // espaces privés fermés.
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://clubproprete.com"}/sitemap.xml`,
  };
}
