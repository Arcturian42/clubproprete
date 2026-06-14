export const runtime = "nodejs";

import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Inclusions partagées : nécessaires pour résoudre l'organisation et le statut
// d'association d'un utilisateur (connexion par mot de passe comme par Google).
const userInclude = {
  companies: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 },
  suppliers: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 },
  candidateProfile: { where: { deletedAt: null } },
  independentProfile: { where: { deletedAt: null } },
  trainingOrganizations: { where: { deletedAt: null }, take: 1 },
  profile: true,
  entityMemberships: {
    where: { status: "active", deletedAt: null },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} as const;

type UserWithContext = NonNullable<
  Awaited<ReturnType<typeof findUserWithContext>>
>;

function findUserWithContext(email: string) {
  return prisma.user.findUnique({ where: { email }, include: userInclude });
}

/**
 * Détecte l'organisation (via EntityMember puis fallback legacy) et le statut
 * de membre association d'un utilisateur, pour alimenter la session.
 */
async function resolveOrgContext(
  user: UserWithContext
): Promise<{ organization: string | null; associationMember: boolean }> {
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

  return { organization: organizationName, associationMember: isAssociationMember };
}

/** Met l'utilisateur DB au format attendu par le callback jwt (types/next-auth.d.ts). */
async function toSessionUser(user: UserWithContext) {
  const { organization, associationMember } = await resolveOrgContext(user);
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    role: user.mainRole,
    status: user.status,
    associationMember,
    organization,
    phone: user.phone ?? "",
  };
}

// Le provider Google n'est actif que si ses identifiants sont configurés, pour
// ne pas casser l'environnement (build/CI) quand l'OAuth n'est pas branché.
const googleConfigured = Boolean(
  (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
    (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)
);

export const isGoogleAuthEnabled = googleConfigured;

const providers: Provider[] = [
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
      const user = await findUserWithContext(email);
      // Un compte supprimé (soft-delete) ne peut plus se connecter.
      if (!user || user.deletedAt || !user.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return toSessionUser(user);
    },
  }),
];

if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      // Liaison par email : on rattache une connexion Google à un compte
      // existant de même adresse (la création/résolution se fait dans signIn).
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    // Création/résolution du compte lors d'une connexion Google (pas d'adapter :
    // on gère nous-mêmes l'utilisateur en base, puis on enrichit `user` pour que
    // le callback jwt d'authConfig peuple la session normalement).
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = (profile?.email ?? user.email ?? "").toLowerCase();
      if (!email) return false;
      // Liaison par email sensible : on exige une vérification d'email *positive*
      // (un claim absent/undefined ne doit pas suffire à rattacher l'identité
      // Google à un compte existant).
      if (profile?.email_verified !== true) return false;

      try {
        let dbUser = await findUserWithContext(email);
        // Un compte supprimé n'est jamais réutilisé : on en recrée un nouveau.
        if (dbUser?.deletedAt) dbUser = null;

        if (!dbUser) {
          const fullName = (profile?.name ?? "").trim();
          const firstName =
            (profile?.given_name as string | undefined) || fullName.split(" ")[0] || "Membre";
          const lastName =
            (profile?.family_name as string | undefined) ||
            fullName.split(" ").slice(1).join(" ") ||
            "";

          try {
            await prisma.$transaction(async (tx) => {
              const created = await tx.user.create({
                data: {
                  email,
                  firstName,
                  lastName,
                  avatarUrl: (profile?.picture as string | undefined) ?? null,
                  mainRole: "registered_user",
                  emailVerified: true,
                  termsAcceptedAt: new Date(),
                },
              });
              await tx.userProfile.create({
                data: {
                  userId: created.id,
                  profileType: "registered_user",
                  completionScore: 15,
                  verificationStatus: "draft",
                  associationStatus: "not_applicable",
                  visibility: "public",
                },
              });
            });
          } catch (createError) {
            // Collision unique (P2002) si deux premiers logins concurrents pour le
            // même email : on ignore et on relit l'utilisateur créé par l'autre requête.
            console.warn("Google signIn: création concurrente probable, relecture.", createError);
          }

          dbUser = await findUserWithContext(email);
        }

        if (!dbUser) return false;

        // Enrichit l'objet `user` transmis ensuite au callback jwt.
        Object.assign(user, await toSessionUser(dbUser));
        return true;
      } catch (error) {
        console.error("Google signIn error:", error);
        return false;
      }
    },
  },
});
