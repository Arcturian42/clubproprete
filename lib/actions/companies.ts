"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getPublishedCompanies(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { verificationStatus: "approved", deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { descriptionShort: { contains: search } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { services: true, _count: { select: { jobs: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}

export async function getCompanyByOwner(userId: string) {
  return prisma.company.findFirst({
    where: { ownerUserId: userId, deletedAt: null },
    include: { services: true, clientTypes: true },
  });
}

const updateCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  legalName: z.string().optional(),
  siret: z.string().optional(),
  descriptionShort: z.string().optional(),
  descriptionLong: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  employeeCount: z.string().optional(),
  foundedYear: z.string().optional(),
  logo: z.string().optional(),
  photos: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  clients: z.array(z.string()).optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export async function updateCompanyProfile(data: UpdateCompanyInput) {
  try {
    const parsed = updateCompanySchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { id, services, clients, foundedYear, logo, photos, ...rest } = parsed.data;

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...rest,
        logoUrl: logo || null,
        photos: photos && photos.length > 0 ? JSON.stringify(photos) : null,
        foundedAt: foundedYear ? new Date(`${foundedYear}-01-01`) : null,
      },
    });

    await prisma.companyService.deleteMany({ where: { companyId: id } });
    if (services && services.length > 0) {
      await prisma.companyService.createMany({
        data: services.map((serviceType) => ({
          companyId: id,
          serviceType,
          isPrimary: false,
        })),
      });
    }

    await prisma.companyClientType.deleteMany({ where: { companyId: id } });
    if (clients && clients.length > 0) {
      await prisma.companyClientType.createMany({
        data: clients.map((clientType) => ({
          companyId: id,
          clientType,
        })),
      });
    }

    revalidatePath("/dashboard/entreprise");
    revalidatePath("/dashboard");
    return { success: true, company };
  } catch (err) {
    console.error("updateCompanyProfile error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
