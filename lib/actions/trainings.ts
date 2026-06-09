"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPublishedTrainings(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { status: "approved", deletedAt: null };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { category: { contains: search } },
      { city: { contains: search } },
    ];
  }

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
    await prisma.training.update({
      where: { id: trainingId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/formations");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("softDeleteTraining error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
