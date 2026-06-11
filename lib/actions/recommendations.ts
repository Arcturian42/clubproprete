"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireUser, canViewCandidate } from "@/lib/permissions";
import { notifyUser } from "@/lib/notifications";

const submitRecommendationSchema = z.object({
  candidateUserId: z.string(),
  relationship: z.string().min(1, "Précisez votre relation professionnelle."),
  comment: z
    .string()
    .min(10, "La recommandation doit contenir au moins 10 caractères.")
    .max(2000, "La recommandation ne peut pas dépasser 2000 caractères."),
  authorRole: z.string().max(120).optional(),
});

const requestRecommendationSchema = z.object({
  candidateUserId: z.string(),
  authorEmail: z.string().email().optional(),
  authorEntityId: z.string().optional(),
});

const writeRecommendationSchema = z.object({
  recommendationId: z.string(),
  relationship: z.string().min(1, "Précisez la relation professionnelle."),
  comment: z.string().min(10, "Le commentaire doit contenir au moins 10 caractères.").max(2000),
  authorRole: z.string().optional(),
});

const updateStatusSchema = z.object({
  recommendationId: z.string(),
  status: z.enum(["pending", "published", "declined"]),
});

export async function requestRecommendation(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = requestRecommendationSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { candidateUserId, authorEmail, authorEntityId } = parsed.data;

    const candidate = await prisma.user.findFirst({
      where: { id: candidateUserId, deletedAt: null },
      select: { id: true },
    });

    if (!candidate) {
      return { success: false, message: "Candidat introuvable." };
    }

    const existing = await prisma.recommendation.findFirst({
      where: {
        candidateUserId,
        OR: [
          { authorUserId: session.user.id },
          ...(authorEmail ? [{ authorEmail }] : []),
        ],
        status: { not: "declined" },
      },
    });

    if (existing) {
      return { success: false, message: "Vous avez déjà demandé ou rédigé une recommandation pour ce candidat." };
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        candidateUserId,
        authorUserId: session.user.id,
        authorEmail: authorEmail || null,
        authorEntityId: authorEntityId || null,
        status: "pending",
      },
    });

    revalidatePath(`/profil`);
    return { success: true, recommendation };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("requestRecommendation error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function writeRecommendation(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = writeRecommendationSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { recommendationId, relationship, comment, authorRole } = parsed.data;

    const recommendation = await prisma.recommendation.findFirst({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return { success: false, message: "Recommandation introuvable." };
    }

    if (recommendation.authorUserId !== session.user.id) {
      return { success: false, message: "Vous n'êtes pas l'auteur de cette recommandation." };
    }

    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        relationship,
        comment,
        authorRole: authorRole || recommendation.authorRole,
        status: "published",
      },
    });

    revalidatePath(`/profil`);
    revalidatePath(`/membres/${recommendation.candidateUserId}`);
    return { success: true, recommendation: updated };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("writeRecommendation error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

/**
 * Un membre connecté rédige directement une recommandation pour un autre
 * membre (façon LinkedIn). Elle reste "pending" tant que le membre concerné
 * ne l'a pas publiée depuis sa page /profil.
 */
export async function submitRecommendation(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = submitRecommendationSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { candidateUserId, relationship, comment, authorRole } = parsed.data;

    if (candidateUserId === session.user.id) {
      return { success: false, message: "Vous ne pouvez pas vous recommander vous-même." };
    }

    const candidate = await prisma.user.findFirst({
      where: { id: candidateUserId, deletedAt: null },
      select: { id: true },
    });

    if (!candidate) {
      return { success: false, message: "Membre introuvable." };
    }

    const existing = await prisma.recommendation.findFirst({
      where: {
        candidateUserId,
        authorUserId: session.user.id,
        status: { not: "declined" },
        deletedAt: null,
      },
    });

    if (existing) {
      return { success: false, message: "Vous avez déjà rédigé une recommandation pour ce membre." };
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        candidateUserId,
        authorUserId: session.user.id,
        relationship,
        comment,
        authorRole: authorRole || null,
        status: "pending",
      },
    });

    await notifyUser({
      userId: candidateUserId,
      type: "recommendation_received",
      title: "Vous avez reçu une recommandation",
      body: "Un membre du réseau vous a recommandé. Validez-la pour l'afficher sur votre profil.",
      link: "/profil",
    });

    revalidatePath(`/membres/${candidateUserId}`);
    return { success: true, recommendation };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("submitRecommendation error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

/**
 * Recommandations publiées d'un membre dont le profil est public : elles ont
 * été validées par l'intéressé, elles sont donc consultables par tous.
 */
export async function getPublicRecommendations(userId: string) {
  const profile = await prisma.userProfile.findFirst({
    where: { userId, deletedAt: null },
    select: { visibility: true },
  });

  if (!profile || profile.visibility !== "public") {
    return [];
  }

  return prisma.recommendation.findMany({
    where: {
      candidateUserId: userId,
      status: "published",
      deletedAt: null,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecommendationsForCandidate(candidateUserId: string) {
  try {
    const session = await requireUser();
    const canView = await canViewCandidate(
      { id: session.user.id, role: session.user.role },
      candidateUserId
    );

    if (!canView) {
      throw new PermissionError("FORBIDDEN", "Vous n'avez pas accès aux recommandations de ce candidat.");
    }

    const recommendations = await prisma.recommendation.findMany({
      where: {
        candidateUserId,
        status: "published",
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, recommendations };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getRecommendationsForCandidate error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function updateRecommendationStatus(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = updateStatusSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { recommendationId, status } = parsed.data;

    const recommendation = await prisma.recommendation.findFirst({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return { success: false, message: "Recommandation introuvable." };
    }

    if (recommendation.candidateUserId !== session.user.id) {
      return { success: false, message: "Seul le candidat concerné peut modifier le statut." };
    }

    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { status },
    });

    revalidatePath(`/profil`);
    return { success: true, recommendation: updated };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateRecommendationStatus error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getMyRecommendationsReceived() {
  try {
    const session = await requireUser();

    const recommendations = await prisma.recommendation.findMany({
      where: {
        candidateUserId: session.user.id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, recommendations };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getMyRecommendationsReceived error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getMyRecommendationsGiven() {
  try {
    const session = await requireUser();

    const recommendations = await prisma.recommendation.findMany({
      where: {
        authorUserId: session.user.id,
        deletedAt: null,
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, recommendations };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getMyRecommendationsGiven error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
