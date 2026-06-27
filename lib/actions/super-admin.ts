"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, PermissionError } from "@/lib/permissions";

// Espace réservé au super admin : agrégation « vision globale » de toute la
// plateforme (comptes, annuaires, contenus, modération, engagement et activité
// récente). Lecture seule — les actions de contrôle restent dans les server
// actions dédiées (updateUserRole, updateEntityStatus, etc.).

async function requireSuperAdmin() {
  const session = await requireUser();
  if (session.user.role !== "super_admin") {
    throw new PermissionError("FORBIDDEN", "Accès réservé au super admin.");
  }
  return session.user;
}

type StatusRows = { verificationStatus: string; _count: { _all: number } }[];
type GenericStatusRows = { status: string; _count: { _all: number } }[];

function toVerificationMap(rows: StatusRows) {
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    byStatus[row.verificationStatus] = row._count._all;
    total += row._count._all;
  }
  return { total, byStatus };
}

function toStatusMap(rows: GenericStatusRows) {
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    byStatus[row.status] = row._count._all;
    total += row._count._all;
  }
  return { total, byStatus };
}

export type SuperAdminDashboard = Awaited<ReturnType<typeof loadDashboard>>;

async function loadDashboard() {
  const now = Date.now();
  const last7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const live = { deletedAt: null } as const;

  // ── Comptes & identité ───────────────────────────────────────────────────
  const [
    usersTotal,
    usersActive,
    usersSuspended,
    usersNew7,
    usersNew30,
    emailUnverified,
    profilePending,
    onboardingIncomplete,
    missingProfile,
    roleRows,
  ] = await Promise.all([
    prisma.user.count({ where: live }),
    prisma.user.count({ where: { ...live, status: "active" } }),
    prisma.user.count({ where: { ...live, status: "suspended" } }),
    prisma.user.count({ where: { ...live, createdAt: { gte: last7 } } }),
    prisma.user.count({ where: { ...live, createdAt: { gte: last30 } } }),
    prisma.user.count({ where: { ...live, emailVerified: false } }),
    prisma.userProfile.count({ where: { deletedAt: null, verificationStatus: "pending" } }),
    prisma.user.count({
      where: { ...live, OR: [{ profile: { is: null } }, { profile: { is: { onboardingCompletedAt: null } } }] },
    }),
    prisma.user.count({ where: { ...live, profile: { is: null } } }),
    prisma.user.groupBy({ by: ["mainRole"], where: live, _count: { _all: true } }),
  ]);

  const roleDistribution = roleRows
    .map((row) => ({ role: row.mainRole, count: row._count._all }))
    .sort((a, b) => b.count - a.count);

  // ── Annuaires (santé des fiches par statut de vérification) ───────────────
  const [companyRows, supplierRows, trainingOrgRows, independentRows, candidatesTotal] = await Promise.all([
    prisma.company.groupBy({ by: ["verificationStatus"], where: live, _count: { _all: true } }),
    prisma.supplier.groupBy({ by: ["verificationStatus"], where: live, _count: { _all: true } }),
    prisma.trainingOrganization.groupBy({ by: ["verificationStatus"], where: live, _count: { _all: true } }),
    prisma.independentProfile.groupBy({ by: ["verificationStatus"], where: live, _count: { _all: true } }),
    prisma.candidateProfile.count({ where: live }),
  ]);

  const directory = {
    companies: toVerificationMap(companyRows),
    suppliers: toVerificationMap(supplierRows),
    trainingOrganizations: toVerificationMap(trainingOrgRows),
    independents: toVerificationMap(independentRows),
    candidates: { total: candidatesTotal, byStatus: {} as Record<string, number> },
  };

  // ── Contenus ──────────────────────────────────────────────────────────────
  const [jobRows, trainingRows, articleRows, missionRows] = await Promise.all([
    prisma.job.groupBy({ by: ["status"], where: live, _count: { _all: true } }),
    prisma.training.groupBy({ by: ["status"], where: live, _count: { _all: true } }),
    prisma.article.groupBy({ by: ["status"], where: live, _count: { _all: true } }),
    prisma.subcontractingMission.groupBy({ by: ["status"], where: live, _count: { _all: true } }),
  ]);

  const content = {
    jobs: toStatusMap(jobRows),
    trainings: toStatusMap(trainingRows),
    articles: toStatusMap(articleRows),
    missions: toStatusMap(missionRows),
  };

  // ── File de modération (backlog actionnable) ──────────────────────────────
  const [
    pendingCompanies,
    pendingSuppliers,
    pendingTrainingOrgs,
    pendingJobs,
    pendingMemberships,
    pendingAuthors,
    pendingVerificationRequests,
    pendingRecommendations,
  ] = await Promise.all([
    prisma.company.count({ where: { ...live, verificationStatus: "pending" } }),
    prisma.supplier.count({ where: { ...live, verificationStatus: "pending" } }),
    prisma.trainingOrganization.count({ where: { ...live, verificationStatus: "pending" } }),
    prisma.job.count({ where: { ...live, status: "draft" } }),
    prisma.associationMembership.count({ where: { status: "pending" } }),
    prisma.authorApplication.count({ where: { status: "pending" } }),
    prisma.verificationRequest.count({ where: { status: "pending" } }),
    prisma.recommendation.count({ where: { ...live, status: "pending" } }),
  ]);

  const moderation = {
    companies: pendingCompanies,
    suppliers: pendingSuppliers,
    trainingOrganizations: pendingTrainingOrgs,
    jobs: pendingJobs,
    profiles: profilePending,
    memberships: pendingMemberships,
    authors: pendingAuthors,
    verificationRequests: pendingVerificationRequests,
    recommendations: pendingRecommendations,
  };
  const moderationTotal = Object.values(moderation).reduce((sum, value) => sum + value, 0);

  // ── Engagement ─────────────────────────────────────────────────────────────
  const [newsletterActive, leadsTotal, leadsNew, applicationsTotal, recommendationsTotal, eventsTotal] =
    await Promise.all([
      prisma.newsletterSubscriber.count({ where: { status: "active" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.jobApplication.count({ where: live }),
      prisma.recommendation.count({ where: live }),
      prisma.analyticsEvent.count(),
    ]);

  const engagement = {
    newsletterActive,
    leadsTotal,
    leadsNew,
    applicationsTotal,
    recommendationsTotal,
    eventsTotal,
  };

  // ── Activité récente ────────────────────────────────────────────────────────
  const [recentUsers, recentEvents] = await Promise.all([
    prisma.user.findMany({
      where: live,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mainRole: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        eventName: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return {
    accounts: {
      total: usersTotal,
      active: usersActive,
      suspended: usersSuspended,
      new7: usersNew7,
      new30: usersNew30,
      emailUnverified,
      profilePending,
      onboardingIncomplete,
      missingProfile,
      roleDistribution,
    },
    directory,
    content,
    moderation: { ...moderation, total: moderationTotal },
    engagement,
    recentUsers,
    recentEvents,
  };
}

export async function getSuperAdminDashboard() {
  try {
    await requireSuperAdmin();
    return { success: true as const, data: await loadDashboard() };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false as const, message: err.message };
    }
    console.error("getSuperAdminDashboard error:", err);
    return { success: false as const, message: "Une erreur est survenue." };
  }
}
