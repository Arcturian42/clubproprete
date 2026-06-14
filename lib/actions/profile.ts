"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { PermissionError, requireUser } from "@/lib/permissions";

const updateProfileSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  city: z.string().max(120).optional(),
  website: z.string().max(300).optional(),
  headline: z.string().max(120).optional(),
  linkedinUrl: z
    .string()
    .max(300)
    .url("Le lien LinkedIn doit être une URL valide (https://...).")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(5000).optional(),
  address: z.string().max(300).optional(),
  avatar: z.string().max(1000).optional(),
  photos: z.array(z.string().max(1000)).max(12).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateUserProfile(data: UpdateProfileInput) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "update_profile", 10, 60_000);
    if (!limit.success) {
      return { success: false, message: "Trop de modifications. Veuillez ralentir." };
    }

    const parsed = updateProfileSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const {
      userId,
      firstName,
      lastName,
      email,
      phone,
      city,
      website,
      headline,
      linkedinUrl,
      bio,
      address,
      avatar,
      photos,
      visibility,
    } = parsed.data;

    const session = await requireUser();
    if (session.user.id !== userId) {
      throw new PermissionError("FORBIDDEN", "Vous ne pouvez modifier que votre propre profil.");
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing && existing.id !== userId) {
      return { success: false, errors: { email: ["Cet email est déjà utilisé."] } };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        city: city || null,
        bio: bio || null,
        address: address || null,
        avatarUrl: avatar || null,
        photos: photos && photos.length > 0 ? JSON.stringify(photos) : null,
      },
    });

    if (visibility || headline !== undefined || linkedinUrl !== undefined) {
      const profileFields = {
        ...(visibility ? { visibility } : {}),
        ...(headline !== undefined ? { headline: headline.trim() || null } : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl: linkedinUrl.trim() || null } : {}),
      };
      await prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          profileType: session.user.role || "registered_user",
          ...profileFields,
        },
        update: profileFields,
      });
    }

    const company = await prisma.company.findFirst({
      where: { ownerUserId: userId },
    });

    if (company && website) {
      await prisma.company.update({
        where: { id: company.id },
        data: { website },
      });
    }

    revalidatePath("/profil");
    revalidatePath("/dashboard");
    revalidatePath(`/membres/${userId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateUserProfile error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function getUserProfile(userId: string) {
  const session = await requireUser();
  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

  if (!isAdmin && session.user.id !== userId) {
    throw new PermissionError("FORBIDDEN", "Vous n'avez pas accès à ce profil.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      companies: { where: { deletedAt: null } },
      candidateProfile: { where: { deletedAt: null } },
      independentProfile: { where: { deletedAt: null } },
      trainingOrganizations: { where: { deletedAt: null } },
    },
  });

  if (!user) return null;

  // Ne jamais renvoyer le hash du mot de passe côté client.
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Suppression du compte par l'utilisateur lui-même : soft-delete (deletedAt)
 * + anonymisation des données personnelles. L'email d'origine est remplacé par
 * une adresse « tombstone » pour le libérer (réinscription possible) et le
 * mot de passe est effacé : plus aucune connexion n'est possible (un garde
 * `deletedAt` est aussi présent côté authentification).
 */
export async function deleteMyAccount() {
  try {
    const limit = rateLimitByIp(await getClientIp(), "delete_account", 5, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }

    const session = await requireUser();
    const userId = session.user.id;

    const existing = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, message: "Compte introuvable ou déjà supprimé." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: "suspended",
        passwordHash: null,
        email: `deleted-${userId}@comptes-supprimes.clubproprete.local`,
        firstName: "Compte",
        lastName: "supprimé",
        phone: null,
        avatarUrl: null,
        bio: null,
        photos: null,
        address: null,
        city: null,
        newsletterOptIn: false,
      },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("deleteMyAccount error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
