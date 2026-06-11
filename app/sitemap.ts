import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Genere a la requete : le contenu depend de la base, qui n'est pas
// disponible au build (Vercel) et evolue en continu.
export const dynamic = "force-dynamic";

type EntityRows = Awaited<ReturnType<typeof fetchEntities>>;

function fetchEntities() {
  return Promise.all([
    prisma.company.findMany({
      where: { deletedAt: null, verificationStatus: "approved" },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.supplier.findMany({
      where: { deletedAt: null, verificationStatus: "approved" },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.trainingOrganization.findMany({
      where: { deletedAt: null, verificationStatus: "approved" },
      select: { id: true, updatedAt: true },
    }),
    prisma.job.findMany({
      where: { deletedAt: null, status: "published" },
      select: { id: true, updatedAt: true },
    }),
    prisma.training.findMany({
      where: { deletedAt: null, status: "approved" },
      select: { id: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { deletedAt: null, status: "published" },
      select: { id: true, slug: true, updatedAt: true },
    }),
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clubproprete.com";

  let entities: EntityRows = [[], [], [], [], [], []];
  try {
    entities = await fetchEntities();
  } catch (error) {
    console.error("sitemap: base indisponible, repli sur les routes statiques", error);
  }
  const [companies, suppliers, trainingOrganizations, jobs, trainings, articles] = entities;

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/emploi`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/annuaire/societes`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/annuaire/fournisseurs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/annuaire/centres-formation`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/formations`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/ressources`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/association`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/independants`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/candidats`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/cgu`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/politique-confidentialite`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const dynamicRoutes = [
    ...companies.map((c) => ({
      url: `${baseUrl}/annuaire/societes/${c.slug ?? c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...suppliers.map((s) => ({
      url: `${baseUrl}/annuaire/fournisseurs/${s.slug ?? s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...trainingOrganizations.map((organization) => ({
      url: `${baseUrl}/annuaire/centres-formation/${organization.id}`,
      lastModified: organization.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...jobs.map((j) => ({
      url: `${baseUrl}/emploi/${j.id}`,
      lastModified: j.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...trainings.map((t) => ({
      url: `${baseUrl}/formations/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...articles.map((a) => ({
      url: `${baseUrl}/ressources/${a.slug ?? a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
