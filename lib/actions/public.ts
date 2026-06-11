"use server";

import { prisma } from "@/lib/prisma";

export async function getCompanyById(idOrSlug: string) {
  return prisma.company.findFirst({
    where: {
      deletedAt: null,
      verificationStatus: "approved",
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      services: true,
      clientTypes: true,
      jobs: {
        where: { status: "published", deletedAt: null },
      },
    },
  });
}

export async function getTrainingById(id: string) {
  return prisma.training.findUnique({
    where: { id, deletedAt: null, status: "approved" },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true },
      },
      sessions: true,
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findFirst({
    where: {
      deletedAt: null,
      status: "published",
      OR: [{ id }, { slug: id }],
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
}

export async function getSupplierById(idOrSlug: string) {
  return prisma.supplier.findFirst({
    where: {
      deletedAt: null,
      verificationStatus: "approved",
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      services: true,
      owner: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
}

export async function getPublicProfile(userId: string, options?: { includePrivate?: boolean }) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      city: true,
      avatarUrl: true,
      photos: true,
      email: true,
      profile: {
        select: {
          visibility: true,
          verificationStatus: true,
          associationStatus: true,
          headline: true,
          linkedinUrl: true,
        },
      },
    },
  });

  if (!user || (!options?.includePrivate && user.profile?.visibility !== "public")) {
    return null;
  }

  const memberships = await prisma.entityMember.findMany({
    where: {
      userId,
      status: "active",
      deletedAt: null,
    },
    select: {
      role: true,
      entityType: true,
      entityId: true,
    },
  });

  const companies = await prisma.company.findMany({
    where: {
      id: { in: memberships.filter((m) => m.entityType === "company").map((m) => m.entityId) },
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  const suppliers = await prisma.supplier.findMany({
    where: {
      id: { in: memberships.filter((m) => m.entityType === "supplier").map((m) => m.entityId) },
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  const trainingOrgs = await prisma.trainingOrganization.findMany({
    where: {
      id: { in: memberships.filter((m) => m.entityType === "training_organization").map((m) => m.entityId) },
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  return {
    ...user,
    email: options?.includePrivate ? user.email : null,
    memberships: memberships.map((m) => ({
      ...m,
      entityName:
        companies.find((c) => c.id === m.entityId)?.name ??
        suppliers.find((s) => s.id === m.entityId)?.name ??
        trainingOrgs.find((t) => t.id === m.entityId)?.name ??
        "Entité",
    })),
  };
}

export async function getEntityMembers(entityType: "company" | "supplier" | "training_organization", entityId: string) {
  const memberships = await prisma.entityMember.findMany({
    where: {
      entityType,
      entityId,
      status: "active",
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          profile: {
            select: {
              visibility: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships;
}
