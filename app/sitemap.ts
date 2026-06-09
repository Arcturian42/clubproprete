import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clubproprete.com";

  const [companies, suppliers, jobs, trainings, articles] = await Promise.all([
    prisma.company.findMany({ where: { verificationStatus: "approved", deletedAt: null }, select: { id: true, updatedAt: true } }),
    prisma.supplier.findMany({ where: { verificationStatus: "approved", deletedAt: null }, select: { id: true, updatedAt: true } }),
    prisma.job.findMany({ where: { status: "published", deletedAt: null }, select: { id: true, updatedAt: true } }),
    prisma.training.findMany({ where: { status: "approved", deletedAt: null }, select: { id: true, updatedAt: true } }),
    prisma.article.findMany({ where: { status: "published", deletedAt: null }, select: { id: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    "",
    "/annuaire/societes",
    "/annuaire/fournisseurs",
    "/emploi",
    "/formations",
    "/association",
    "/ressources",
    "/independants",
    "/sous-traitance",
    "/mentions-legales",
    "/cgu",
    "/politique-confidentialite",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const dynamicEntries = [
    ...companies.map((c) => ({ url: `${baseUrl}/annuaire/societes/${c.id}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...suppliers.map((s) => ({ url: `${baseUrl}/annuaire/fournisseurs/${s.id}`, lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...jobs.map((j) => ({ url: `${baseUrl}/emploi/${j.id}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...trainings.map((t) => ({ url: `${baseUrl}/formations/${t.id}`, lastModified: t.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${baseUrl}/ressources/${a.id}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
