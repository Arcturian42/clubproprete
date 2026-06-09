"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { setFlash } from "@/lib/flash";

const ROLES = [
  "registered_user",
  "company_owner",
  "verified_company",
  "supplier_owner",
  "verified_supplier",
  "independent_profile",
  "candidate_profile",
  "training_organization",
  "author",
  "association_member",
  "admin",
  "super_admin",
] as const;

async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "super_admin") {
    throw new Error("Forbidden: super_admin required");
  }
  return session!.user;
}

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(ROLES),
});

export async function updateUserRole(formData: FormData) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "super_admin_action", 20, 60_000);
    if (!limit.success) {
      return { success: false, message: "Trop d'actions. Veuillez ralentir." };
    }

    await requireSuperAdmin();

    const raw = Object.fromEntries(formData.entries());
    const parsed = updateUserRoleSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { userId, role } = parsed.data;

    // Interdit de modifier un autre super_admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { mainRole: true },
    });

    if (targetUser?.mainRole === "super_admin") {
      return { success: false, message: "Impossible de modifier un super admin." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mainRole: role },
    });

    revalidatePath("/admin/users");
    setFlash("success", `Rôle mis à jour : ${role}`);
    return { success: true };
  } catch (err) {
    console.error("updateUserRole error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

const suspendUserSchema = z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended"]),
});

export async function updateUserStatus(formData: FormData) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "super_admin_action", 20, 60_000);
    if (!limit.success) {
      return { success: false, message: "Trop d'actions. Veuillez ralentir." };
    }

    await requireSuperAdmin();

    const raw = Object.fromEntries(formData.entries());
    const parsed = suspendUserSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { userId, status } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { mainRole: true },
    });

    if (targetUser?.mainRole === "super_admin") {
      return { success: false, message: "Impossible de modifier un super admin." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    revalidatePath("/admin/users");
    setFlash("success", `Statut mis à jour : ${status}`);
    return { success: true };
  } catch (err) {
    console.error("updateUserStatus error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getUsersList() {
  try {
    await requireSuperAdmin();

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mainRole: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        phoneVerified: true,
        _count: {
          select: {
            companies: true,
            suppliers: true,
            jobs: true,
            trainings: true,
            articles: true,
          },
        },
      },
    });

    return { success: true, users };
  } catch (err) {
    console.error("getUsersList error:", err);
    return { success: false, message: "Accès refusé." };
  }
}

export async function getAdminStats() {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "admin" && role !== "super_admin") {
      throw new Error("Forbidden");
    }

    const [totalUsers, totalCompanies, totalSuppliers, totalJobs, totalTrainings, totalArticles, pendingCompanies, pendingSuppliers, pendingJobs, pendingMemberships] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.supplier.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.training.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.company.count({ where: { deletedAt: null, verificationStatus: "pending" } }),
      prisma.supplier.count({ where: { deletedAt: null, verificationStatus: "pending" } }),
      prisma.job.count({ where: { deletedAt: null, status: "draft" } }),
      prisma.associationMembership.count({ where: { status: "pending" } }),
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        totalCompanies,
        totalSuppliers,
        totalJobs,
        totalTrainings,
        totalArticles,
        pendingTotal: pendingCompanies + pendingSuppliers + pendingJobs + pendingMemberships,
        pendingCompanies,
        pendingSuppliers,
        pendingJobs,
        pendingMemberships,
      },
    };
  } catch (err) {
    console.error("getAdminStats error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
