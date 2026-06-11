"use server";

import { prisma } from "@/lib/prisma";

export async function getPublishedIndependents(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { verificationStatus: "approved", deletedAt: null };
  if (search) {
    where.OR = [
      { displayName: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { bio: { contains: search, mode: "insensitive" } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.independentProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.independentProfile.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}
