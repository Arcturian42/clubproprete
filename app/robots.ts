import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/profil", "/connexion", "/inscription", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://clubproprete.com"}/sitemap.xml`,
  };
}
