"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import {
  ONBOARDING_SITUATIONS,
  SITUATION_ROLE,
  EXPERIENCE_LEVELS,
  type OnboardingSituation,
} from "@/lib/onboarding";
import { SUPPLIER_TAXONOMY, isSupplierFamily } from "@/lib/supplier-taxonomy";
import { uniqueSlug } from "@/lib/slug";

const onboardingSchema = z
  .object({
    phone: z.string().max(30).optional(),
    city: z.string().max(120).optional(),
    linkedinUrl: z
      .string()
      .url("Le lien LinkedIn doit être une URL valide (https://...).")
      .optional()
      .or(z.literal("")),
    situations: z.array(z.enum(ONBOARDING_SITUATIONS)),
    company: z
      .object({
        name: z.string().min(1, "Le nom de la société est obligatoire."),
        siret: z.string().max(20).optional(),
        city: z.string().max(120).optional(),
      })
      .optional(),
    supplier: z
      .object({
        name: z.string().min(1, "Le nom du fournisseur est obligatoire."),
        family: z.string().optional(),
      })
      .optional(),
    training: z
      .object({
        name: z.string().min(1, "Le nom de l'organisme est obligatoire."),
        siret: z.string().max(20).optional(),
        declarationNumber: z.string().max(40).optional(),
        qualiopi: z.boolean().optional(),
      })
      .optional(),
    independent: z
      .object({
        hasBusiness: z.boolean().optional(),
        businessName: z.string().max(160).optional(),
        siret: z.string().max(20).optional(),
        experienceLevel: z.enum(["debutant", "1_3", "3_plus"]).optional(),
        skills: z.string().max(1000).optional(),
      })
      .optional(),
    jobSeeker: z
      .object({
        experienceLevel: z.enum(["debutant", "1_3", "3_plus"]).optional(),
        contracts: z.array(z.string().max(30)).optional(),
        skills: z.string().max(1000).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.situations.includes("company") && !data.company?.name?.trim()) {
      ctx.addIssue({ code: "custom", path: ["company"], message: "Le nom de la société est obligatoire." });
    }
    if (data.situations.includes("supplier") && !data.supplier?.name?.trim()) {
      ctx.addIssue({ code: "custom", path: ["supplier"], message: "Le nom du fournisseur est obligatoire." });
    }
    if (data.situations.includes("training") && !data.training?.name?.trim()) {
      ctx.addIssue({ code: "custom", path: ["training"], message: "Le nom de l'organisme est obligatoire." });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;

function experienceYears(level?: string) {
  return EXPERIENCE_LEVELS.find((item) => item.value === level)?.years ?? null;
}

// Rôles plateforme qu'on ne rétrograde jamais via l'onboarding.
const PROTECTED_ROLES = ["admin", "super_admin", "author"];

function computeMainRole(currentRole: string, situations: OnboardingSituation[]) {
  if (PROTECTED_ROLES.includes(currentRole)) return currentRole;
  for (const situation of ONBOARDING_SITUATIONS) {
    if (situations.includes(situation)) return SITUATION_ROLE[situation];
  }
  return currentRole;
}

export async function completeOnboarding(data: OnboardingInput) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "onboarding", 10, 300_000);
    if (!limit.success) {
      return { success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." };
    }

    const session = await requireUser();
    const userId = session.user.id;

    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const input = parsed.data;
    const situations = input.situations;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        companies: { where: { deletedAt: null }, take: 1 },
        suppliers: { where: { deletedAt: null }, take: 1 },
        trainingOrganizations: { where: { deletedAt: null }, take: 1 },
        independentProfile: true,
        candidateProfile: true,
      },
    });
    if (!user) {
      return { success: false, message: "Utilisateur introuvable." };
    }

    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const phone = input.phone?.trim() || user.phone || null;
    const city = input.city?.trim() || user.city || null;
    const linkedinUrl = input.linkedinUrl?.trim() || null;

    const newRole = computeMainRole(user.mainRole, situations);

    // Un compte qui active une fiche pro devient visible publiquement ; un
    // candidat reste privé par défaut (protection des chercheurs d'emploi).
    const hasProEntity = situations.some((s) => s !== "job_seeker");
    const visibility = hasProEntity
      ? "public"
      : situations.includes("job_seeker")
      ? "private"
      : user.profile?.visibility ?? "private";

    let completionScore = 30;
    if (phone) completionScore += 10;
    if (city) completionScore += 10;
    if (linkedinUrl) completionScore += 15;
    if (situations.length > 0) completionScore += 25;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          phone,
          city,
          mainRole: newRole,
        },
      });

      await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          profileType: newRole,
          completionScore,
          verificationStatus: hasProEntity ? "pending" : "draft",
          associationStatus:
            situations.includes("company") || situations.includes("independent")
              ? "draft"
              : "not_applicable",
          visibility,
          linkedinUrl,
          mainNeeds: situations.join(","),
          city,
          onboardingCompletedAt: new Date(),
        },
        update: {
          profileType: newRole,
          completionScore,
          visibility,
          linkedinUrl,
          mainNeeds: situations.join(","),
          city,
          onboardingCompletedAt: new Date(),
        },
      });

      if (situations.includes("company") && input.company && user.companies.length === 0) {
        const companySlug = await uniqueSlug(input.company.name, async (candidate) =>
          Boolean(await tx.company.findUnique({ where: { slug: candidate }, select: { id: true } })),
        );
        const company = await tx.company.create({
          data: {
            ownerUserId: userId,
            name: input.company.name.trim(),
            slug: companySlug,
            legalName: input.company.name.trim(),
            siret: input.company.siret?.trim() || null,
            city: input.company.city?.trim() || city,
            email: user.email,
            phone,
            verificationStatus: "pending",
          },
        });
        await tx.entityMember.create({
          data: { userId, entityType: "company", entityId: company.id, role: "owner" },
        });
      }

      if (situations.includes("supplier") && input.supplier && user.suppliers.length === 0) {
        const family = isSupplierFamily(input.supplier.family) ? input.supplier.family : "materiel";
        const subCategory = SUPPLIER_TAXONOMY[family].subs[0];
        const supplierSlug = await uniqueSlug(input.supplier.name, async (candidate) =>
          Boolean(await tx.supplier.findUnique({ where: { slug: candidate }, select: { id: true } })),
        );
        const supplier = await tx.supplier.create({
          data: {
            ownerUserId: userId,
            name: input.supplier.name.trim(),
            slug: supplierSlug,
            legalName: input.supplier.name.trim(),
            category: subCategory,
            family,
            subCategory,
            email: user.email,
            phone,
            contactName: fullName,
            verificationStatus: "pending",
          },
        });
        await tx.entityMember.create({
          data: { userId, entityType: "supplier", entityId: supplier.id, role: "owner" },
        });
      }

      if (situations.includes("training") && input.training && user.trainingOrganizations.length === 0) {
        const trainingOrganization = await tx.trainingOrganization.create({
          data: {
            ownerUserId: userId,
            name: input.training.name.trim(),
            legalName: input.training.name.trim(),
            siret: input.training.siret?.trim() || null,
            declarationNumber: input.training.declarationNumber?.trim() || null,
            qualiopiStatus: input.training.qualiopi ? "certified" : null,
            email: user.email,
            phone,
            contactName: fullName,
            verificationStatus: "pending",
          },
        });
        await tx.entityMember.create({
          data: {
            userId,
            entityType: "training_organization",
            entityId: trainingOrganization.id,
            role: "owner",
          },
        });
      }

      if (situations.includes("independent")) {
        const independent = input.independent ?? {};
        const skillsBio = independent.skills?.trim() || null;
        await tx.independentProfile.upsert({
          where: { userId },
          create: {
            userId,
            displayName: `${user.firstName ?? ""} ${(user.lastName ?? "").charAt(0)}.`.trim() || fullName,
            businessName: independent.businessName?.trim() || fullName,
            legalStatus: independent.hasBusiness ? "auto_entreprise" : null,
            siret: independent.siret?.trim() || null,
            experienceYears: experienceYears(independent.experienceLevel),
            bio: skillsBio,
            email: user.email,
            phone,
            city,
            verificationStatus: "pending",
            associationStatus: "draft",
          },
          update: {
            businessName: independent.businessName?.trim() || undefined,
            legalStatus: independent.hasBusiness ? "auto_entreprise" : undefined,
            siret: independent.siret?.trim() || undefined,
            experienceYears: experienceYears(independent.experienceLevel) ?? undefined,
            bio: skillsBio ?? undefined,
            phone: phone ?? undefined,
            city: city ?? undefined,
            deletedAt: null,
          },
        });
      }

      if (situations.includes("job_seeker")) {
        const jobSeeker = input.jobSeeker ?? {};
        const skillsBio = jobSeeker.skills?.trim() || null;
        const desiredContracts =
          jobSeeker.contracts && jobSeeker.contracts.length > 0 ? jobSeeker.contracts.join(",") : null;
        await tx.candidateProfile.upsert({
          where: { userId },
          create: {
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone,
            city,
            experienceYears: experienceYears(jobSeeker.experienceLevel),
            desiredContracts,
            bio: skillsBio,
          },
          update: {
            phone: phone ?? undefined,
            city: city ?? undefined,
            experienceYears: experienceYears(jobSeeker.experienceLevel) ?? undefined,
            desiredContracts: desiredContracts ?? undefined,
            bio: skillsBio ?? undefined,
            deletedAt: null,
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/profil");

    return { success: true, role: newRole };
  } catch (err) {
    console.error("completeOnboarding error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
