"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";
import { optionalSiret } from "@/lib/validators";

export async function getPublishedTrainingOrganizations(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { verificationStatus: "approved", deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { declarationNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.trainingOrganization.findMany({
      where,
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.trainingOrganization.count({ where }),
  ]);

  const trainingCounts = await prisma.training.groupBy({
    by: ["creatorEntityId"],
    where: {
      creatorType: "training_organization",
      creatorEntityId: { in: items.map((item) => item.id) },
      status: "approved",
      deletedAt: null,
    },
    _count: { id: true },
  });
  const countByOrg = new Map(trainingCounts.map((count) => [count.creatorEntityId, count._count.id]));

  return {
    items: items.map((item) => ({ ...item, trainingsCount: countByOrg.get(item.id) ?? 0 })),
    total,
    page: currentPage,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTrainingOrganizationById(id: string) {
  const organization = await prisma.trainingOrganization.findFirst({
    where: { id, verificationStatus: "approved", deletedAt: null },
    include: { owner: { select: { id: true, firstName: true, lastName: true } } },
  });

  if (!organization) return null;

  const trainings = await prisma.training.findMany({
    where: {
      creatorType: "training_organization",
      creatorEntityId: id,
      status: "approved",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return { ...organization, trainings };
}

export async function getMyTrainingOrganization() {
  const session = await requireUser();
  const membership = await prisma.entityMember.findFirst({
    where: {
      userId: session.user.id,
      entityType: "training_organization",
      status: "active",
      deletedAt: null,
    },
    select: { entityId: true },
    orderBy: { createdAt: "desc" },
  });

  if (membership) {
    return prisma.trainingOrganization.findFirst({ where: { id: membership.entityId, deletedAt: null } });
  }

  return prisma.trainingOrganization.findFirst({
    where: { ownerUserId: session.user.id, deletedAt: null },
  });
}

const trainingOrganizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le nom du centre est obligatoire."),
  legalName: z.string().optional(),
  siret: optionalSiret,
  declarationNumber: z.string().optional(),
  qualiopiStatus: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  contactName: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
});

export async function upsertTrainingOrganization(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = trainingOrganizationSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { id, email, ...data } = parsed.data;
    let organizationId = id || null;

    if (organizationId) {
      await requireEntityRole(session.user.id, "training_organization", organizationId, ["owner", "admin"]);
    } else {
      const existing = await getMyTrainingOrganization();
      organizationId = existing?.id ?? null;
    }

    const organization = organizationId
      ? await prisma.trainingOrganization.update({
          where: { id: organizationId },
          data: {
            ...data,
            email: email || null,
            verificationStatus: "pending",
          },
        })
      : await prisma.trainingOrganization.create({
          data: {
            ownerUserId: session.user.id,
            ...data,
            email: email || null,
            verificationStatus: "pending",
          },
        });

    await prisma.entityMember.upsert({
      where: {
        userId_entityType_entityId: {
          userId: session.user.id,
          entityType: "training_organization",
          entityId: organization.id,
        },
      },
      update: { role: "owner", status: "active", deletedAt: null },
      create: {
        userId: session.user.id,
        entityType: "training_organization",
        entityId: organization.id,
        role: "owner",
      },
    });

    // Élève un compte générique au rôle centre de formation (cumul préservé pour les autres rôles).
    await prisma.user.updateMany({
      where: { id: session.user.id, mainRole: "registered_user" },
      data: { mainRole: "training_organization" },
    });

    revalidatePath("/dashboard/centre-formation");
    revalidatePath("/annuaire/centres-formation");
    revalidatePath("/admin");
    return { success: true, organization };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("upsertTrainingOrganization error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
