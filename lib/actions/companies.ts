"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";
import { optionalSiret } from "@/lib/validators";
import { uniqueSlug } from "@/lib/slug";
import { notifyUser } from "@/lib/notifications";

export async function getPublishedCompanies(search?: string, page?: number, limit = 12, region?: string) {
  // Publication immédiate : toute fiche créée est visible. La vérification
  // (badge) est un parcours séparé, à la demande du propriétaire.
  const where: Record<string, unknown> = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { descriptionShort: { contains: search, mode: "insensitive" } },
    ];
  }
  if (region) {
    where.region = region;
  }

  const safeLimit = Math.min(Math.max(1, limit), 50);
  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { services: true, _count: { select: { jobs: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / safeLimit);
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
  linkedin: z.string().max(300).optional(),
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
        // Publiée immédiatement, non vérifiée : le badge s'obtient via une
        // demande de vérification (RDV + questionnaire) validée par l'admin.
        verificationStatus: "draft",
        // La fiche est créée par son propriétaire : elle est réclamée d'office.
        claimedStatus: "claimed",
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
        // Modifier sa fiche ne touche pas au statut de vérification : une
        // fiche vérifiée garde son badge, une fiche non vérifiée reste visible.
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

const requestVerificationSchema = z.object({
  companyId: z.string(),
  yearsInBusiness: z.string().min(1, "Indiquez depuis combien de temps vous exercez.").max(120),
  employeeCount: z.string().min(1, "Indiquez votre effectif.").max(60),
  mainClients: z.string().max(500).optional(),
  additionalInfo: z.string().max(2000).optional(),
  preferredSlot: z.string().min(1, "Indiquez vos disponibilités pour le rendez-vous.").max(300),
  contactPhone: z.string().min(1, "Indiquez un numéro pour être recontacté.").max(30),
});

/**
 * Le propriétaire d'une fiche demande sa vérification : questionnaire +
 * créneau de rendez-vous avec Club Propreté. La fiche passe en "pending"
 * (toujours visible) jusqu'à la décision de l'admin après l'entretien.
 */
export async function requestCompanyVerification(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = requestVerificationSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { companyId, ...answers } = parsed.data;

    await requireEntityRole(session.user.id, "company", companyId, ["owner", "admin"]);

    const company = await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { id: true, name: true, verificationStatus: true },
    });
    if (!company) {
      return { success: false, message: "Fiche introuvable." };
    }
    if (company.verificationStatus === "approved") {
      return { success: false, message: "Cette fiche est déjà vérifiée." };
    }

    const existing = await prisma.verificationRequest.findFirst({
      where: { entityType: "company", entityId: companyId, status: "pending" },
    });
    if (existing) {
      return { success: false, message: "Une demande de vérification est déjà en cours pour cette fiche." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.verificationRequest.create({
        data: {
          entityType: "company",
          entityId: companyId,
          requestedBy: session.user.id,
          yearsInBusiness: answers.yearsInBusiness,
          employeeCount: answers.employeeCount,
          mainClients: answers.mainClients || null,
          additionalInfo: answers.additionalInfo || null,
          preferredSlot: answers.preferredSlot,
          contactPhone: answers.contactPhone,
        },
      });
      await tx.company.update({
        where: { id: companyId },
        data: { verificationStatus: "pending" },
      });
    });

    // Prévient les admins qu'un rendez-vous de vérification est à planifier.
    const admins = await prisma.user.findMany({
      where: { mainRole: { in: ["admin", "super_admin"] }, deletedAt: null },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        notifyUser({
          userId: admin.id,
          type: "verification_request",
          title: "Nouvelle demande de vérification",
          body: `La société « ${company.name} » demande la vérification de sa fiche. Créneau souhaité : ${answers.preferredSlot}.`,
          link: "/admin",
        })
      )
    );

    revalidatePath("/dashboard/entreprise");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("requestCompanyVerification error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

/**
 * Dernière demande de vérification d'une fiche, pour afficher l'état du
 * parcours dans le dashboard du propriétaire.
 */
export async function getCompanyVerificationRequest(companyId: string) {
  try {
    const session = await requireUser();
    await requireEntityRole(session.user.id, "company", companyId, ["owner", "admin"]);

    return prisma.verificationRequest.findFirst({
      where: { entityType: "company", entityId: companyId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
}
