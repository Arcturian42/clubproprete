"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { PermissionError, requireUser } from "@/lib/permissions";

const updateProfileSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  photos: z.array(z.string()).optional(),
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

    const { userId, firstName, lastName, email, phone, city, website, bio, address, avatar, photos, visibility } =
      parsed.data;

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

    if (visibility) {
      await prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          profileType: session.user.role || "registered_user",
          visibility,
        },
        update: { visibility },
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

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      companies: { where: { deletedAt: null } },
      candidateProfile: { where: { deletedAt: null } },
      independentProfile: { where: { deletedAt: null } },
      trainingOrganizations: { where: { deletedAt: null } },
    },
  });
}
