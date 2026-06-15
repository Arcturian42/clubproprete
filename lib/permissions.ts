import type { Session } from "next-auth";
import type { Company, Supplier, User, UserProfile } from "@prisma/client";
import type { Role } from "./types";
import { prisma } from "./prisma";

export const ENTITY_TYPES = ["company", "supplier", "training_organization"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_ROLES = ["owner", "admin", "recruiter", "member"] as const;
export type EntityRole = (typeof ENTITY_ROLES)[number];

export type PermissionErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND";

export class PermissionError extends Error {
  code: PermissionErrorCode;

  constructor(code: PermissionErrorCode, message: string) {
    super(message);
    this.name = "PermissionError";
    this.code = code;
  }
}

export type AuthenticatedSession = Session & {
  user: Session["user"] & { id: string; role?: string | null };
};

export type EntityMembership = {
  userId: string;
  entityType: EntityType;
  entityId: string;
  role: EntityRole;
  status: "active";
};

export type PermissionUser = Pick<User, "id" | "emailVerified" | "mainRole"> & {
  role?: string | null;
  profile?: Pick<UserProfile, "verificationStatus"> | null;
};

export type PermissionPublishingEntity = Pick<Company | Supplier, "id" | "ownerUserId" | "verificationStatus">;
export type PermissionCompany = PermissionPublishingEntity;

export type CandidateViewer = {
  id: string;
  role?: string | null;
  mainRole?: string | null;
};

export async function requireUser(): Promise<AuthenticatedSession> {
  const { auth } = await import("../auth");
  const session = await auth();

  if (!session?.user?.id) {
    throw new PermissionError("UNAUTHENTICATED", "Vous devez être connecté.");
  }

  // Le JWT peut conserver un ancien rôle après une promotion ou une suspension.
  // Les autorisations sensibles doivent toujours refléter l'état courant en base.
  const databaseUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mainRole: true, status: true, deletedAt: true },
  });

  if (!databaseUser || databaseUser.deletedAt) {
    throw new PermissionError("UNAUTHENTICATED", "Ce compte n'existe plus.");
  }

  if (databaseUser.status !== "active") {
    throw new PermissionError("FORBIDDEN", "Ce compte est suspendu.");
  }

  session.user.role = databaseUser.mainRole;

  return session as AuthenticatedSession;
}

export async function requireEntityRole(
  userId: string,
  entityType: EntityType,
  entityId: string,
  roles: readonly EntityRole[]
): Promise<EntityMembership> {
  if (!userId) {
    throw new PermissionError("UNAUTHENTICATED", "Vous devez être connecté.");
  }

  const membership = await findEntityMembership(userId, entityType, entityId);

  if (!membership) {
    throw new PermissionError("NOT_FOUND", "Entité introuvable ou inaccessible.");
  }

  if (!hasAllowedEntityRole(membership.role, roles)) {
    throw new PermissionError("FORBIDDEN", "Vous n'avez pas les droits nécessaires.");
  }

  return membership;
}

export function canPublishJob(
  user: PermissionUser,
  entity: PermissionPublishingEntity,
  entityRole?: EntityRole | null
) {
  const publisherRole = entityRole ?? (entity.ownerUserId === user.id ? "owner" : null);

  return (
    isVerifiedPersonalAccount(user) &&
    entity.verificationStatus === "approved" &&
    (publisherRole === "owner" || publisherRole === "recruiter")
  );
}

export async function canViewCandidate(viewer: CandidateViewer, candidateUserId: string) {
  if (viewer.id === candidateUserId || getPlatformRole(viewer) === "super_admin") {
    return true;
  }

  const companyMemberships = await prisma.entityMember.findMany({
    where: {
      userId: viewer.id,
      entityType: "company",
      status: "active",
      deletedAt: null,
      role: { in: ["owner", "admin", "recruiter"] },
    },
    select: { entityId: true },
  });
  const memberCompanyIds = companyMemberships.map((membership) => membership.entityId);
  const supplierMemberships = await prisma.entityMember.findMany({
    where: {
      userId: viewer.id,
      entityType: "supplier",
      status: "active",
      deletedAt: null,
      role: { in: ["owner", "admin", "recruiter"] },
    },
    select: { entityId: true },
  });
  const legacySuppliers = await prisma.supplier.findMany({
    where: { ownerUserId: viewer.id, deletedAt: null },
    select: { id: true },
  });
  const memberSupplierIds = [
    ...supplierMemberships.map((membership) => membership.entityId),
    ...legacySuppliers.map((supplier) => supplier.id),
  ];

  const [matchingCompanyCount, matchingSupplierJobCount] = await Promise.all([
    prisma.company.count({
      where: {
        verificationStatus: "approved",
        deletedAt: null,
        OR: [{ ownerUserId: viewer.id }, { id: { in: memberCompanyIds } }],
        jobs: {
          some: {
            deletedAt: null,
            applications: {
              some: {
                deletedAt: null,
                candidateProfile: {
                  userId: candidateUserId,
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
    }),
    prisma.job.count({
      where: {
        employerType: "supplier",
        employerEntityId: { in: memberSupplierIds },
        deletedAt: null,
        applications: {
          some: {
            deletedAt: null,
            candidateProfile: {
              userId: candidateUserId,
              deletedAt: null,
            },
          },
        },
      },
    }),
  ]);

  return matchingCompanyCount > 0 || matchingSupplierJobCount > 0;
}

export function isVerifiedPersonalAccount(user: PermissionUser) {
  return user.emailVerified || user.profile?.verificationStatus === "approved";
}

export function hasAllowedEntityRole(role: EntityRole, roles: readonly EntityRole[]) {
  return roles.includes(role);
}

function getPlatformRole(user: CandidateViewer) {
  return user.role ?? user.mainRole ?? null;
}

async function findLegacyOwnerMembership(
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<EntityMembership | null> {
  const where = { id: entityId, ownerUserId: userId, deletedAt: null };

  if (entityType === "company") {
    const company = await prisma.company.findFirst({ where, select: { id: true } });
    return company ? { userId, entityType, entityId: company.id, role: "owner", status: "active" } : null;
  }

  if (entityType === "supplier") {
    const supplier = await prisma.supplier.findFirst({ where, select: { id: true } });
    return supplier ? { userId, entityType, entityId: supplier.id, role: "owner", status: "active" } : null;
  }

  const trainingOrganization = await prisma.trainingOrganization.findFirst({
    where,
    select: { id: true },
  });
  return trainingOrganization
    ? { userId, entityType, entityId: trainingOrganization.id, role: "owner", status: "active" }
    : null;
}

async function findEntityMembership(
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<EntityMembership | null> {
  const membership = await prisma.entityMember.findFirst({
    where: {
      userId,
      entityType,
      entityId,
      status: "active",
      deletedAt: null,
    },
    select: {
      role: true,
    },
  });

  if (membership && isEntityRole(membership.role)) {
    return { userId, entityType, entityId, role: membership.role, status: "active" };
  }

  return findLegacyOwnerMembership(userId, entityType, entityId);
}

function isEntityRole(role: string): role is EntityRole {
  return ENTITY_ROLES.includes(role as EntityRole);
}

export function canAccessSubcontracting(roles: Role[]) {
  return roles.includes("association_member") || roles.includes("admin") || roles.includes("super_admin");
}

export function canPublishMission(roles: Role[]) {
  return (
    roles.includes("association_member") &&
    (roles.includes("company_owner") || roles.includes("verified_company") || roles.includes("admin"))
  );
}

export function canModerate(roles: Role[]) {
  return roles.includes("admin") || roles.includes("super_admin");
}

export function needsAdminValidation(status: string) {
  return status === "pending" || status === "draft";
}

export async function canViewPublicProfile(viewerId: string | null, profileUserId: string) {
  if (viewerId === profileUserId) return true;

  const profile = await prisma.userProfile.findFirst({
    where: { userId: profileUserId, deletedAt: null },
    select: { visibility: true },
  });

  if (!profile || profile.visibility !== "public") {
    return false;
  }

  return true;
}
