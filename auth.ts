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
          },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          role: user.mainRole,
          status: user.status,
          associationMember:
            user.companies[0]?.associationMember ??
            (user.independentProfile?.associationStatus === "approved"),
          organization:
            user.companies[0]?.name ??
            user.suppliers[0]?.name ??
            user.trainingOrganizations[0]?.name ??
            user.independentProfile?.businessName ??
            user.independentProfile?.city ??
            user.candidateProfile?.city ??
            null,
          phone: user.phone ?? "",
        };
      },
    }),
  ],
});
