export const runtime = "nodejs";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            companies: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            suppliers: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            candidateProfile: { where: { deletedAt: null } },
            independentProfile: { where: { deletedAt: null } },
            trainingOrganizations: { where: { deletedAt: null }, take: 1 },
            profile: true,
            entityMemberships: {
              where: { status: "active", deletedAt: null },
              include: {
                user: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Détecter l'organisation via EntityMember (nouveau RBAC) puis fallback legacy
        const entityMember = user.entityMemberships[0];
        let organizationName: string | null = null;
        let isAssociationMember = false;

        if (entityMember) {
          if (entityMember.entityType === "company") {
            const company = await prisma.company.findFirst({
              where: { id: entityMember.entityId, deletedAt: null },
              select: { name: true, associationMember: true },
            });
            if (company) {
              organizationName = company.name;
              isAssociationMember = company.associationMember ?? false;
            }
          } else if (entityMember.entityType === "supplier") {
            const supplier = await prisma.supplier.findFirst({
              where: { id: entityMember.entityId, deletedAt: null },
              select: { name: true },
            });
            if (supplier) {
              organizationName = supplier.name;
            }
          } else if (entityMember.entityType === "training_organization") {
            const org = await prisma.trainingOrganization.findFirst({
              where: { id: entityMember.entityId, deletedAt: null },
              select: { name: true },
            });
            if (org) {
              organizationName = org.name;
            }
          }
        }

        // Fallback legacy
        if (!organizationName) {
          organizationName =
            user.companies[0]?.name ??
            user.suppliers[0]?.name ??
            user.trainingOrganizations[0]?.name ??
            user.independentProfile?.businessName ??
            user.independentProfile?.city ??
            user.candidateProfile?.city ??
            null;
        }

        if (!isAssociationMember) {
          isAssociationMember = Boolean(
            user.companies[0]?.associationMember ||
              user.profile?.associationStatus === "approved" ||
              user.independentProfile?.associationStatus === "approved"
          );
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          role: user.mainRole,
          status: user.status,
          associationMember: isAssociationMember,
          organization: organizationName,
          phone: user.phone ?? "",
        };
      },
    }),
  ],
});
