import type { Session } from "next-auth";
import type { Company, User, UserProfile } from "@prisma/client";
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

export type PermissionCompany = Pick<Company, "id" | "ownerUserId" | "verificationStatus">;

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
  company: PermissionCompany,
  entityRole?: EntityRole | null
) {
  const publisherRole = entityRole ?? (company.ownerUserId === user.id ? "owner" : null);

  return (
    isVerifiedPersonalAccount(user) &&
    company.verificationStatus === "approved" &&
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

  const matchingCompanyCount = await prisma.company.count({
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
  });

  return matchingCompanyCount > 0;
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
