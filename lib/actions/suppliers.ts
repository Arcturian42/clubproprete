"use server";

import { prisma } from "@/lib/prisma";

export async function getPublishedSuppliers(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { verificationStatus: "approved", deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { category: { contains: search } },
      { city: { contains: search } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: { services: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}
