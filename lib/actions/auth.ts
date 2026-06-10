"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { signIn } from "@/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimitByIp, rateLimitByEmail } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { setFlash } from "@/lib/flash";

const signupSchema = z.object({
  email: z.string().email("Veuillez saisir un email valide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  firstName: z.string().min(1, "Le prénom est obligatoire."),
  lastName: z.string().min(1, "Le nom est obligatoire."),
  phone: z.string().optional(),
  organization: z.string().optional(),
  role: z.enum([
    "company_owner",
    "supplier_owner",
    "independent_profile",
    "candidate_profile",
    "training_organization",
  ]),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions." }),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;

export async function registerUser(data: SignupInput) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "register", 5, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }

    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { email, password, firstName, lastName, phone, organization, role } = parsed.data;
    const organizationName = organization?.trim() || `${firstName} ${lastName}`.trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, errors: { email: ["Cet email est déjà utilisé."] } };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          mainRole: role,
          // Le compte personnel est auto-vérifié à l'inscription : il n'existe pas de
          // parcours de double opt-in. La validation métier reste portée par la modération
          // admin de l'entité (société/fournisseur/centre). Sans cela, isVerifiedPersonalAccount
          // resterait toujours faux et aucune offre ne pourrait être publiée.
          emailVerified: true,
          termsAcceptedAt: new Date(),
        },
      });

      await tx.userProfile.create({
        data: {
          userId: createdUser.id,
          profileType: role,
          completionScore: role === "candidate_profile" ? 35 : 30,
          verificationStatus: role === "candidate_profile" ? "draft" : "pending",
          associationStatus:
            role === "company_owner" || role === "independent_profile" ? "draft" : "not_applicable",
          visibility: role === "candidate_profile" ? "private" : "public",
          primaryGoal: organizationName || null,
        },
      });

      if (role === "company_owner") {
        const company = await tx.company.create({
          data: {
            ownerUserId: createdUser.id,
            name: organizationName,
            legalName: organizationName,
            email,
            phone: phone || null,
            verificationStatus: "pending",
          },
        });
        await tx.entityMember.create({
          data: {
            userId: createdUser.id,
            entityType: "company",
            entityId: company.id,
            role: "owner",
          },
        });
      } else if (role === "supplier_owner") {
        const supplier = await tx.supplier.create({
          data: {
            ownerUserId: createdUser.id,
            name: organizationName,
            legalName: organizationName,
            category: "materiel",
            family: "materiel",
            subCategory: "chariots_menage",
            email,
            phone: phone || null,
            contactName: `${firstName} ${lastName}`.trim(),
            verificationStatus: "pending",
          },
        });
        await tx.entityMember.create({
          data: {
            userId: createdUser.id,
            entityType: "supplier",
            entityId: supplier.id,
            role: "owner",
          },
        });
      } else if (role === "candidate_profile") {
        await tx.candidateProfile.create({
          data: {
            userId: createdUser.id,
            firstName,
            lastName,
            email,
            phone: phone || null,
            city: organization?.trim() || null,
          },
        });
      } else if (role === "independent_profile") {
        await tx.independentProfile.create({
          data: {
            userId: createdUser.id,
            displayName: `${firstName} ${lastName.charAt(0)}.`,
            businessName: organizationName,
            email,
            phone: phone || null,
            city: organization?.trim() || null,
            verificationStatus: "pending",
            associationStatus: "draft",
          },
        });
      } else if (role === "training_organization") {
        const trainingOrganization = await tx.trainingOrganization.create({
          data: {
            ownerUserId: createdUser.id,
            name: organizationName,
            legalName: organizationName,
            email,
            phone: phone || null,
            contactName: `${firstName} ${lastName}`.trim(),
            verificationStatus: "pending",
          },
        });
        await tx.entityMember.create({
          data: {
            userId: createdUser.id,
            entityType: "training_organization",
            entityId: trainingOrganization.id,
            role: "owner",
          },
        });
      }

      return createdUser;
    });

    await sendWelcomeEmail(user.email, firstName);

    return { success: true, userId: user.id };
  } catch (err) {
    console.error("registerUser error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "login", 10, 300_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, message: "Email ou mot de passe incorrect." };
  }
}
