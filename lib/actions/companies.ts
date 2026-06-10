"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";
import { optionalSiret } from "@/lib/validators";
import { uniqueSlug } from "@/lib/slug";

export async function getPublishedCompanies(search?: string, page?: number, limit = 12, region?: string) {
  const where: Record<string, unknown> = { verificationStatus: "approved", deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { descriptionShort: { contains: search } },
    ];
  }
  if (region) {
    where.region = region;
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
  const session = await requireUser();
  if (session.user.id !== userId) {
    throw new PermissionError("FORBIDDEN", "Vous ne pouvez accéder qu'à vos propres données.");
  }

  // Recherche via EntityMember (nouveau RBAC) puis fallback ownerUserId
  const membership = await prisma.entityMember.findFirst({
    where: {
      userId,
      entityType: "company",
      status: "active",
      deletedAt: null,
    },
    select: { entityId: true },
    orderBy: { createdAt: "desc" },
  });

  if (membership) {
    return prisma.company.findFirst({
      where: { id: membership.entityId, deletedAt: null },
      include: { services: true, clientTypes: true },
    });
  }

  return prisma.company.findFirst({
    where: { ownerUserId: userId, deletedAt: null },
    include: { services: true, clientTypes: true },
  });
}

const updateCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  legalName: z.string().optional(),
  siret: optionalSiret,
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

const createCompanySchema = updateCompanySchema.omit({ id: true });

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export async function createCompanyProfile(data: CreateCompanyInput) {
  try {
    const session = await requireUser();
    const parsed = createCompanySchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const existing = await getCompanyByOwner(session.user.id);
    if (existing) {
      // Évite les doublons : redirige vers la mise à jour de la fiche existante.
      return updateCompanyProfile({ ...parsed.data, id: existing.id });
    }

    const { services, clients, foundedYear, logo, photos, ...rest } = parsed.data;

    const slug = await uniqueSlug(rest.name, async (candidate) =>
      Boolean(await prisma.company.findUnique({ where: { slug: candidate }, select: { id: true } })),
    );

    const company = await prisma.company.create({
      data: {
        ...rest,
        slug,
        ownerUserId: session.user.id,
        logoUrl: logo || null,
        photos: photos && photos.length > 0 ? JSON.stringify(photos) : null,
        foundedAt: foundedYear ? new Date(`${foundedYear}-01-01`) : null,
        verificationStatus: "pending",
      },
    });

    await prisma.entityMember.upsert({
      where: {
        userId_entityType_entityId: {
          userId: session.user.id,
          entityType: "company",
          entityId: company.id,
        },
      },
      update: { role: "owner", status: "active", deletedAt: null },
      create: {
        userId: session.user.id,
        entityType: "company",
        entityId: company.id,
        role: "owner",
      },
    });

    // Élève un compte générique au rôle correspondant pour que son dashboard reflète
    // sa nouvelle capacité. Les comptes ayant déjà un rôle structurel sont conservés
    // (cumul de capacités via EntityMember).
    await prisma.user.updateMany({
      where: { id: session.user.id, mainRole: "registered_user" },
      data: { mainRole: "company_owner" },
    });

    if (services && services.length > 0) {
      await prisma.companyService.createMany({
        data: services.map((serviceType) => ({
          companyId: company.id,
          serviceType,
          isPrimary: false,
        })),
      });
    }

    if (clients && clients.length > 0) {
      await prisma.companyClientType.createMany({
        data: clients.map((clientType) => ({
          companyId: company.id,
          clientType,
        })),
      });
    }

    revalidatePath("/dashboard/entreprise");
    revalidatePath("/dashboard");
    revalidatePath("/annuaire/societes");
    revalidatePath("/admin");
    return { success: true, company };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }

    console.error("createCompanyProfile error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function updateCompanyProfile(data: UpdateCompanyInput) {
  try {
    const session = await requireUser();
    const parsed = updateCompanySchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { id, services, clients, foundedYear, logo, photos, ...rest } = parsed.data;

    await requireEntityRole(session.user.id, "company", id, ["owner", "admin"]);

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...rest,
        logoUrl: logo || null,
        photos: photos && photos.length > 0 ? JSON.stringify(photos) : null,
        foundedAt: foundedYear ? new Date(`${foundedYear}-01-01`) : null,
        verificationStatus: "pending",
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
    revalidatePath("/annuaire/societes");
    revalidatePath(`/annuaire/societes/${id}`);
    revalidatePath("/admin");
    return { success: true, company };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }

    console.error("updateCompanyProfile error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
