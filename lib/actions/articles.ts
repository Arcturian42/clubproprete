"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireUser } from "@/lib/permissions";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function getUniqueArticleSlug(titleOrSlug: string) {
  const base = slugify(titleOrSlug) || `article-${Date.now()}`;
  let slug = base;
  let suffix = 2;

  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function hasAuthorAccess(userId: string, role?: string | null) {
  if (role === "author" || role === "admin" || role === "super_admin") {
    return true;
  }

  const approvedApplication = await prisma.authorApplication.findFirst({
    where: { userId, status: "approved" },
    select: { id: true },
  });

  return Boolean(approvedApplication);
}

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
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, total, page: currentPage, totalPages };
}

export async function getArticlesByAuthor(authorId: string) {
  return prisma.article.findMany({
    where: { authorId, status: "published", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true, readTime: true, category: true },
  });
}

export async function getMyAuthorWorkspace() {
  try {
    const session = await requireUser();

    const [application, articles, canWrite] = await Promise.all([
      prisma.authorApplication.findFirst({
        where: { userId: session.user.id },
        include: { article: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.article.findMany({
        where: { authorId: session.user.id, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      }),
      hasAuthorAccess(session.user.id, session.user.role),
    ]);

    return { application, articles, canWrite };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { application: null, articles: [], canWrite: false };
    }
    console.error("getMyAuthorWorkspace error:", err);
    return { application: null, articles: [], canWrite: false };
  }
}

export async function softDeleteArticle(articleId: string) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const article = await prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { authorId: true },
    });

    if (!article) {
      return { success: false, message: "Article introuvable." };
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

    if (!isAdmin && article.authorId !== userId) {
      return { success: false, message: "Vous n'êtes pas l'auteur de cet article." };
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/ressources");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("softDeleteArticle error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

const createArticleSchema = z.object({
  title: z.string().min(3, "Le titre est obligatoire."),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featuredImage: z.string().optional(),
  readTime: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

const authorApplicationSchema = z.object({
  title: z.string().min(5, "Proposez un titre d'article."),
  excerpt: z.string().min(20, "Ajoutez un résumé d'au moins 20 caractères."),
  content: z.string().min(80, "Le premier article doit contenir au moins 80 caractères."),
  category: z.string().optional(),
  motivation: z.string().min(10, "Expliquez votre motivation en quelques mots."),
  expertise: z.string().optional(),
});

export async function requestAuthorAccess(formData: FormData) {
  try {
    const session = await requireUser();
    const limit = rateLimitByIp(await getClientIp(), "author_request", 5, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de demandes envoyées récemment. Veuillez réessayer plus tard." };
    }
    const userId = session.user.id;
    const raw = Object.fromEntries(formData.entries());
    const parsed = authorApplicationSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const existing = await prisma.authorApplication.findFirst({
      where: { userId, status: { in: ["pending", "approved"] } },
      select: { id: true, status: true },
    });

    if (existing) {
      return {
        success: false,
        message:
          existing.status === "approved"
            ? "Votre accès auteur est déjà validé."
            : "Votre demande auteur est déjà en attente.",
      };
    }

    const data = parsed.data;
    const slug = await getUniqueArticleSlug(data.title);

    const application = await prisma.$transaction(async (tx) => {
      const article = await tx.article.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category || "Tribune",
          authorId: userId,
          status: "pending",
        },
      });

      return tx.authorApplication.create({
        data: {
          userId,
          articleId: article.id,
          motivation: data.motivation,
          expertise: data.expertise || null,
          status: "pending",
        },
        include: { article: true },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/auteur");
    revalidatePath("/admin");
    return { success: true, application };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("requestAuthorAccess error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function createArticle(formData: FormData) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const raw = Object.fromEntries(formData.entries());
    const parsed = createArticleSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    const isAuthor = await hasAuthorAccess(userId, session.user.role);

    if (!isAuthor) {
      return { success: false, message: "Vous n'avez pas les droits pour publier un article." };
    }

    const { status: requestedStatus, ...articleData } = data;
    const status = requestedStatus === "draft" ? "draft" : "pending";
    const slug = articleData.slug ? await getUniqueArticleSlug(articleData.slug) : await getUniqueArticleSlug(articleData.title);

    const article = await prisma.article.create({
      data: {
        ...articleData,
        slug,
        authorId: userId,
        status,
      },
    });

    revalidatePath("/ressources");
    revalidatePath("/dashboard/auteur");
    return { success: true, article };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("createArticle error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function submitDraftArticle(articleId: string) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const article = await prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { authorId: true, status: true },
    });

    if (!article) {
      return { success: false, message: "Article introuvable." };
    }

    if (article.authorId !== userId) {
      return { success: false, message: "Vous n'êtes pas l'auteur de cet article." };
    }

    if (article.status !== "draft") {
      return { success: false, message: "Seul un brouillon peut être soumis à la modération." };
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { status: "pending" },
    });

    revalidatePath("/dashboard/auteur");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("submitDraftArticle error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
