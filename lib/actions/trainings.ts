"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

export async function getPublishedTrainings(search?: string, page?: number, limit = 12) {
  // Une formation n'est publique que si elle est approuvée ET portée par une entité
  // validée (société / fournisseur / centre). On précharge les identifiants d'entités
  // approuvées pour filtrer en base et conserver une pagination correcte.
  const [approvedCompanies, approvedSuppliers, approvedOrganizations] = await Promise.all([
    prisma.company.findMany({ where: { verificationStatus: "approved", deletedAt: null }, select: { id: true } }),
    prisma.supplier.findMany({ where: { verificationStatus: "approved", deletedAt: null }, select: { id: true } }),
    prisma.trainingOrganization.findMany({ where: { verificationStatus: "approved", deletedAt: null }, select: { id: true } }),
  ]);

  const approvedEntityFilter = {
    OR: [
      { creatorType: "company", creatorEntityId: { in: approvedCompanies.map((c) => c.id) } },
      { creatorType: "supplier", creatorEntityId: { in: approvedSuppliers.map((s) => s.id) } },
      { creatorType: "training_organization", creatorEntityId: { in: approvedOrganizations.map((o) => o.id) } },
      // Formation sans entité rattachée (créée/validée directement par l'admin).
      { creatorEntityId: null },
    ],
  };

  const and: Record<string, unknown>[] = [approvedEntityFilter];
  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where: Record<string, unknown> = { status: "approved", deletedAt: null, AND: and };

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.training.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.training.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}

export async function softDeleteTraining(trainingId: string) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const training = await prisma.training.findFirst({
      where: { id: trainingId, deletedAt: null },
      select: { creatorUserId: true, creatorEntityId: true, creatorType: true },
    });

    if (!training) {
      return { success: false, message: "Formation introuvable." };
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

    if (!isAdmin) {
      if (training.creatorUserId !== userId) {
        return { success: false, message: "Vous n'êtes pas l'auteur de cette formation." };
      }

      if (training.creatorEntityId && training.creatorType) {
        const entityType =
          training.creatorType === "company"
            ? "company"
            : training.creatorType === "supplier"
            ? "supplier"
            : training.creatorType === "training_organization"
            ? "training_organization"
            : null;

        if (entityType) {
          await requireEntityRole(userId, entityType, training.creatorEntityId, ["owner", "admin"]);
        }
      }
    }

    await prisma.training.update({
      where: { id: trainingId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/formations");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("softDeleteTraining error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

const createTrainingSchema = z.object({
  title: z.string().min(3, "Le titre est obligatoire."),
  category: z.string().min(1, "La catégorie est obligatoire."),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  prerequisites: z.string().optional(),
  duration: z.string().optional(),
  format: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  certificationName: z.string().optional(),
  fundingOptions: z.string().optional(),
  priceInfoOptional: z.string().optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  creatorType: z.string().min(1),
  creatorEntityId: z.string().optional(),
  // Sessions optionnelles, une par ligne : "AAAA-MM-JJ | Ville | Places".
  sessions: z.string().optional(),
});

export async function createTraining(formData: FormData) {
  try {
    const session = await requireUser();
    const limit = await rateLimitByIp(await getClientIp(), "create_training", 20, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de formations soumises récemment. Veuillez réessayer plus tard." };
    }
    const userId = session.user.id;

    const raw = Object.fromEntries(formData.entries());
    const parsed = createTrainingSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    if (data.creatorEntityId) {
      const entityType =
        data.creatorType === "company"
          ? "company"
          : data.creatorType === "supplier"
          ? "supplier"
          : data.creatorType === "training_organization"
          ? "training_organization"
          : null;

      if (entityType) {
        await requireEntityRole(userId, entityType, data.creatorEntityId, ["owner", "admin", "member"]);
      }
    }

    const { sessions: sessionsRaw, ...trainingData } = data;

    const training = await prisma.training.create({
      data: {
        ...trainingData,
        creatorUserId: userId,
        status: "pending",
      },
    });

    // Sessions optionnelles : "AAAA-MM-JJ | Ville | Places" par ligne.
    const sessionRows = (sessionsRaw || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 20)
      .map((line) => {
        const [dateStr, location, seatsStr] = line.split("|").map((part) => part.trim());
        const startDate = dateStr ? new Date(dateStr) : null;
        if (!startDate || Number.isNaN(startDate.getTime())) return null;
        return {
          trainingId: training.id,
          startDate,
          location: location || null,
          availableSeats: seatsStr && /^\d+$/.test(seatsStr) ? parseInt(seatsStr, 10) : null,
          status: "scheduled",
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (sessionRows.length > 0) {
      await prisma.trainingSession.createMany({ data: sessionRows });
    }

    revalidatePath("/formations");
    return { success: true, training };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("createTraining error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getTrainingPublishingEntitiesForCurrentUser() {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const memberships = await prisma.entityMember.findMany({
      where: {
        userId,
        status: "active",
        deletedAt: null,
        entityType: { in: ["company", "supplier", "training_organization"] },
        role: { in: ["owner", "admin", "member"] },
      },
      select: { entityType: true, entityId: true, role: true },
    });

    const companyIds = memberships.filter((membership) => membership.entityType === "company").map((membership) => membership.entityId);
    const supplierIds = memberships.filter((membership) => membership.entityType === "supplier").map((membership) => membership.entityId);
    const organizationIds = memberships.filter((membership) => membership.entityType === "training_organization").map((membership) => membership.entityId);

    const [companies, suppliers, organizations, legacyCompanies, legacySuppliers, legacyOrganizations] = await Promise.all([
      companyIds.length
        ? prisma.company.findMany({
            where: { id: { in: companyIds }, deletedAt: null },
            select: { id: true, name: true, verificationStatus: true },
          })
        : [],
      supplierIds.length
        ? prisma.supplier.findMany({
            where: { id: { in: supplierIds }, deletedAt: null },
            select: { id: true, name: true, verificationStatus: true },
          })
        : [],
      organizationIds.length
        ? prisma.trainingOrganization.findMany({
            where: { id: { in: organizationIds }, deletedAt: null },
            select: { id: true, name: true, verificationStatus: true },
          })
        : [],
      prisma.company.findMany({
        where: { ownerUserId: userId, deletedAt: null },
        select: { id: true, name: true, verificationStatus: true },
      }),
      prisma.supplier.findMany({
        where: { ownerUserId: userId, deletedAt: null },
        select: { id: true, name: true, verificationStatus: true },
      }),
      prisma.trainingOrganization.findMany({
        where: { ownerUserId: userId, deletedAt: null },
        select: { id: true, name: true, verificationStatus: true },
      }),
    ]);

    const entities = new Map<string, { id: string; name: string; creatorType: "company" | "supplier" | "training_organization"; verificationStatus: string }>();

    for (const company of [...companies, ...legacyCompanies]) {
      entities.set(`company:${company.id}`, { ...company, creatorType: "company" });
    }
    for (const supplier of [...suppliers, ...legacySuppliers]) {
      entities.set(`supplier:${supplier.id}`, { ...supplier, creatorType: "supplier" });
    }
    for (const organization of [...organizations, ...legacyOrganizations]) {
      entities.set(`training_organization:${organization.id}`, { ...organization, creatorType: "training_organization" });
    }

    return Array.from(entities.values());
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getTrainingPublishingEntitiesForCurrentUser error:", err);
    return [];
  }
}
