"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateUserProfile(data: UpdateProfileInput) {
  try {
    const parsed = updateProfileSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { userId, firstName, lastName, email, phone, city, website, bio, address, avatar, photos } =
      parsed.data;

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
    console.error("updateUserProfile error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      companies: { where: { deletedAt: null } },
      candidateProfile: { where: { deletedAt: null } },
      independentProfile: { where: { deletedAt: null } },
      trainingOrganizations: { where: { deletedAt: null } },
    },
  });
}
