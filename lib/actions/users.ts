"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { setFlash } from "@/lib/flash";
import { PermissionError, requireUser } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";
import { notifyUser } from "@/lib/notifications";

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
  const session = await requireUser();
  if (session.user.role !== "super_admin") {
    throw new PermissionError("FORBIDDEN", "Super admin requis.");
  }
  return session.user;
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

    const admin = await requireSuperAdmin();

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

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { mainRole: role } }),
      prisma.analyticsEvent.create({
        data: {
          userId: admin.id,
          eventName: "super_admin.user_role_updated",
          entityType: "user",
          entityId: userId,
          metadata: JSON.stringify({ role }),
        },
      }),
    ]);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    setFlash("success", `Rôle mis à jour : ${role}`);
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateUserRole error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

const suspendUserSchema = z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended"]),
});

const updateProfileVerificationSchema = z.object({
  userId: z.string(),
  status: z.enum(["draft", "pending", "approved", "rejected"]),
});

export async function updateUserProfileVerification(formData: FormData) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "super_admin_action", 20, 60_000);
    if (!limit.success) {
      return { success: false, message: "Trop d'actions. Veuillez ralentir." };
    }

    const admin = await requireSuperAdmin();
    const parsed = updateProfileVerificationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { userId, status } = parsed.data;
    const profile = await prisma.userProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!profile) {
      return { success: false, message: "Ce compte ne possède pas encore de profil." };
    }

    await prisma.$transaction([
      prisma.userProfile.update({ where: { id: profile.id }, data: { verificationStatus: status } }),
      prisma.analyticsEvent.create({
        data: {
          userId: admin.id,
          eventName: "super_admin.user_profile_verification_updated",
          entityType: "user",
          entityId: userId,
          metadata: JSON.stringify({ status }),
        },
      }),
    ]);

    await notifyUser({
      userId,
      type: "moderation",
      title: status === "approved" ? "Profil vérifié" : "Mise à jour de la vérification du profil",
      body:
        status === "approved"
          ? "Votre profil Club Propreté a été vérifié par l'équipe d'administration."
          : status === "rejected"
            ? "La vérification de votre profil nécessite des corrections. Consultez vos informations avant une nouvelle demande."
            : "Le statut de vérification de votre profil a été mis à jour.",
      link: "/profil",
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    setFlash("success", `Vérification du profil mise à jour : ${status}`);
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateUserProfileVerification error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function updateUserStatus(formData: FormData) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "super_admin_action", 20, 60_000);
    if (!limit.success) {
      return { success: false, message: "Trop d'actions. Veuillez ralentir." };
    }

    const admin = await requireSuperAdmin();

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

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { status } }),
      prisma.analyticsEvent.create({
        data: {
          userId: admin.id,
          eventName: "super_admin.user_status_updated",
          entityType: "user",
          entityId: userId,
          metadata: JSON.stringify({ status }),
        },
      }),
    ]);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    setFlash("success", `Statut mis à jour : ${status}`);
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateUserStatus error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export type UserListFilters = {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  verification?: string;
};

export async function getUsersList(filters: UserListFilters = {}) {
  try {
    await requireSuperAdmin();

    const currentPage = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(10, filters.limit ?? 25));
    const skip = (currentPage - 1) * limit;
    const query = filters.query?.trim();
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (query) {
      where.OR = [
        { email: { contains: query, mode: "insensitive" } },
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ];
    }

    if (filters.status === "active" || filters.status === "suspended") {
      where.status = filters.status;
    }

    if (["draft", "pending", "approved", "rejected"].includes(filters.verification ?? "")) {
      where.profile = { is: { verificationStatus: filters.verification } };
    } else if (filters.verification === "missing") {
      where.profile = { is: null };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
          phone: true,
          city: true,
          profile: {
            select: {
              verificationStatus: true,
              completionScore: true,
              onboardingCompletedAt: true,
              visibility: true,
              updatedAt: true,
            },
          },
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
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true, users, total, page: currentPage, totalPages: Math.ceil(total / limit) };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getUsersList error:", err);
    return { success: false, message: "Accès refusé." };
  }
}

export async function getUserAccountStats() {
  try {
    await requireSuperAdmin();
    const base = { deletedAt: null } as const;
    const [total, active, suspended, emailUnverified, profilePending, profileApproved, missingProfile, onboardingIncomplete] =
      await Promise.all([
        prisma.user.count({ where: base }),
        prisma.user.count({ where: { ...base, status: "active" } }),
        prisma.user.count({ where: { ...base, status: "suspended" } }),
        prisma.user.count({ where: { ...base, emailVerified: false } }),
        prisma.user.count({ where: { ...base, profile: { is: { verificationStatus: "pending" } } } }),
        prisma.user.count({ where: { ...base, profile: { is: { verificationStatus: "approved" } } } }),
        prisma.user.count({ where: { ...base, profile: { is: null } } }),
        prisma.user.count({
          where: {
            ...base,
            OR: [{ profile: { is: null } }, { profile: { is: { onboardingCompletedAt: null } } }],
          },
        }),
      ]);

    return {
      success: true,
      stats: { total, active, suspended, emailUnverified, profilePending, profileApproved, missingProfile, onboardingIncomplete },
    };
  } catch (err) {
    if (err instanceof PermissionError) return { success: false, message: err.message };
    console.error("getUserAccountStats error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getPendingUserProfiles(limit = 8) {
  try {
    await requireSuperAdmin();
    return await prisma.user.findMany({
      where: { deletedAt: null, profile: { is: { verificationStatus: "pending", deletedAt: null } } },
      orderBy: { updatedAt: "asc" },
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mainRole: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        profile: {
          select: {
            completionScore: true,
            profileType: true,
            verificationStatus: true,
            onboardingCompletedAt: true,
            city: true,
            region: true,
            headline: true,
            updatedAt: true,
          },
        },
      },
    });
  } catch (err) {
    if (!(err instanceof PermissionError)) console.error("getPendingUserProfiles error:", err);
    return [];
  }
}

export async function getUserAdminDetail(userId: string) {
  try {
    await requireSuperAdmin();
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        profile: true,
        companies: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        suppliers: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        trainingOrganizations: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        independentProfile: true,
        candidateProfile: true,
        memberships: { orderBy: { createdAt: "desc" } },
        entityMemberships: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        _count: {
          select: {
            jobs: true,
            trainings: true,
            articles: true,
            notifications: true,
            analyticsEvents: true,
            subcontractingMissions: true,
            subcontractingResponses: true,
            recommendationsReceived: true,
            recommendationsGiven: true,
          },
        },
      },
    });
    return { success: true, user };
  } catch (err) {
    if (err instanceof PermissionError) return { success: false, message: err.message };
    console.error("getUserAdminDetail error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getAdminStats() {
  try {
    const session = await requireUser();
    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
      throw new PermissionError("FORBIDDEN", "Accès réservé aux administrateurs.");
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
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getAdminStats error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
