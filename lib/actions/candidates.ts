"use server";

import { prisma } from "@/lib/prisma";

export async function getPublishedCandidates(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { city: { contains: search } },
      { bio: { contains: search } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.candidateProfile.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidateProfile.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}
