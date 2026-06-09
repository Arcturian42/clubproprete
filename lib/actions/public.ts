"use server";

import { prisma } from "@/lib/prisma";

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id, deletedAt: null },
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
    where: { id, deletedAt: null },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true },
      },
      sessions: true,
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id, deletedAt: null },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id, deletedAt: null },
    include: {
      services: true,
      owner: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
}
