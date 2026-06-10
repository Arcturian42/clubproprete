"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireUser } from "@/lib/permissions";
import { sendAssociationMembershipRequestNotification } from "@/lib/email";

const requestMembershipSchema = z.object({
  motivation: z.string().min(10, "Décrivez votre motivation en au moins 10 caractères.").max(1000),
  needs: z.string().max(1000).optional(),
  contribution: z.string().max(1000).optional(),
});

export async function requestAssociationMembership(formData: FormData) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const raw = Object.fromEntries(formData.entries());
    const parsed = requestMembershipSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { motivation, needs, contribution } = parsed.data;

    // Vérifier si une demande est déjà en cours ou acceptée
    const existing = await prisma.associationMembership.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (existing && (existing.status === "pending" || existing.status === "approved")) {
      return {
        success: false,
        message:
          existing.status === "approved"
            ? "Vous êtes déjà membre de l'association."
            : "Vous avez déjà une demande d'adhésion en attente.",
      };
    }

    // Une demande précédente refusée (ou en brouillon) peut être re-soumise.
    const membership = existing
      ? await prisma.associationMembership.update({
          where: { id: existing.id },
          data: {
            profileType: session.user.role || "registered_user",
            entityType: "association",
            motivation,
            needs: needs || null,
            contribution: contribution || null,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
          },
        })
      : await prisma.associationMembership.create({
          data: {
            userId,
            profileType: session.user.role || "registered_user",
            entityType: "association",
            motivation,
            needs: needs || null,
            contribution: contribution || null,
            status: "pending",
          },
        });

    // Notifier l'admin
    await sendAssociationMembershipRequestNotification(
      process.env.ADMIN_EMAIL || "admin@clubproprete.test",
      `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || session.user.email || "Un utilisateur",
      session.user.email || ""
    );

    revalidatePath("/association");
    revalidatePath("/admin");
    return { success: true, membership };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("requestAssociationMembership error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getApprovedMemberships() {
  try {
    const session = await requireUser();
    const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

    if (!isAdmin) {
      throw new PermissionError("FORBIDDEN", "Accès réservé aux administrateurs.");
    }

    return await prisma.associationMembership.findMany({
      where: { status: "approved" },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getApprovedMemberships error:", err);
    return [];
  }
}

export async function getMyMembershipRequest() {
  try {
    const session = await requireUser();

    return await prisma.associationMembership.findFirst({
      where: { userId: session.user.id },
    });
  } catch (err) {
    if (err instanceof PermissionError) {
      return null;
    }
    console.error("getMyMembershipRequest error:", err);
    return null;
  }
}

export async function hasApprovedAssociationMembership(userId: string) {
  const membership = await prisma.associationMembership.findFirst({
    where: { userId, status: "approved" },
    select: { id: true },
  });

  if (membership) return true;

  const profile = await prisma.userProfile.findFirst({
    where: { userId, associationStatus: "approved" },
    select: { id: true },
  });

  return Boolean(profile);
}
