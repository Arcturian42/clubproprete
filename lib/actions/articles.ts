"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPublishedArticles(search?: string, page?: number, limit = 12) {
  const where: Record<string, unknown> = { status: "published", deletedAt: null };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { category: { contains: search } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}

export async function softDeleteArticle(articleId: string) {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/ressources");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("softDeleteArticle error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
