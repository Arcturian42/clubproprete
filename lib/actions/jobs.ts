"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendNewJobNotification, sendAdminNotification, sendJobApplicationNotification, escapeHtml } from "@/lib/email";
import { canPublishJob, PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { notifyUser } from "@/lib/notifications";

const createJobSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères."),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  city: z.string().min(1, "La ville est obligatoire."),
  contractType: z.string().min(1, "Le type de contrat est obligatoire."),
  salaryInfo: z.string().optional(),
  requirements: z.string().optional(),
  companyId: z.string().optional(),
  employerType: z.enum(["company", "supplier"]).default("company"),
  employerEntityId: z.string().optional(),
});

type EmployerType = "company" | "supplier";

type EmployerSummary = {
  id: string;
  type: EmployerType;
  name: string;
  verificationStatus: string;
  href: string;
  ownerEmail?: string | null;
};

type JobWithEmployerFields = {
  companyId: string | null;
  employerType: string;
  employerEntityId: string | null;
  company?: { id: string; slug?: string | null; name: string; verificationStatus?: string | null; owner?: { email: string | null } | null } | null;
};

async function resolveEmployerSummary(job: JobWithEmployerFields): Promise<EmployerSummary | null> {
  if (job.employerType === "supplier" && job.employerEntityId) {
    const supplier = await prisma.supplier.findFirst({
      where: { id: job.employerEntityId, deletedAt: null },
      include: { owner: { select: { email: true } } },
    });
    if (!supplier) return null;
    return {
      id: supplier.id,
      type: "supplier",
      name: supplier.name,
      verificationStatus: supplier.verificationStatus,
      href: `/annuaire/fournisseurs/${supplier.slug ?? supplier.id}`,
      ownerEmail: supplier.owner.email,
    };
  }

  if (job.company) {
    return {
      id: job.company.id,
      type: "company",
      name: job.company.name,
      verificationStatus: job.company.verificationStatus ?? "unknown",
      href: `/annuaire/societes/${job.company.slug ?? job.company.id}`,
      ownerEmail: job.company.owner?.email,
    };
  }

  const companyId = job.companyId ?? (job.employerType === "company" ? job.employerEntityId : null);
  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      include: { owner: { select: { email: true } } },
    });
    if (!company) return null;
    return {
      id: company.id,
      type: "company",
      name: company.name,
      verificationStatus: company.verificationStatus,
      href: `/annuaire/societes/${company.slug ?? company.id}`,
      ownerEmail: company.owner.email,
    };
  }

  return null;
}

async function attachEmployerSummaries<T extends JobWithEmployerFields>(jobs: T[]) {
  const supplierIds = Array.from(
    new Set(jobs.filter((job) => job.employerType === "supplier" && job.employerEntityId).map((job) => job.employerEntityId as string))
  );

  // P1/P5/Q5 : on charge AUSSI les entreprises par lot (une seule requête `in`),
  // au lieu de retomber sur `job.company` éventuellement absent puis sur une
  // requête par offre. On ne requête que les entreprises non déjà incluses.
  const companyIds = Array.from(
    new Set(
      jobs
        .filter((job) => !job.company)
        .map((job) => job.companyId ?? (job.employerType === "company" ? job.employerEntityId : null))
        .filter((id): id is string => Boolean(id))
    )
  );

  const [suppliers, companies] = await Promise.all([
    supplierIds.length
      ? prisma.supplier.findMany({
          where: { id: { in: supplierIds }, deletedAt: null },
          select: { id: true, slug: true, name: true, verificationStatus: true },
        })
      : Promise.resolve([]),
    companyIds.length
      ? prisma.company.findMany({
          where: { id: { in: companyIds }, deletedAt: null },
          select: { id: true, slug: true, name: true, verificationStatus: true },
        })
      : Promise.resolve([]),
  ]);
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const companyById = new Map(companies.map((company) => [company.id, company]));

  return jobs.map((job) => {
    const supplier = job.employerType === "supplier" && job.employerEntityId ? supplierById.get(job.employerEntityId) : null;
    const fallbackCompanyId = job.companyId ?? (job.employerType === "company" ? job.employerEntityId : null);
    const company = job.company
      ? {
          id: job.company.id,
          slug: job.company.slug ?? null,
          name: job.company.name,
          verificationStatus: job.company.verificationStatus ?? "unknown",
        }
      : fallbackCompanyId
      ? companyById.get(fallbackCompanyId) ?? null
      : null;

    const employer = supplier
      ? {
          id: supplier.id,
          type: "supplier" as const,
          name: supplier.name,
          verificationStatus: supplier.verificationStatus,
          href: `/annuaire/fournisseurs/${supplier.slug ?? supplier.id}`,
        }
      : company
      ? {
          id: company.id,
          type: "company" as const,
          name: company.name,
          verificationStatus: company.verificationStatus ?? "unknown",
          href: `/annuaire/societes/${company.slug ?? company.id}`,
        }
      : null;

    return {
      ...job,
      employer,
      employerName: employer?.name ?? "Entreprise",
      employerHref: employer?.href ?? null,
    };
  });
}

export async function createJob(formData: FormData) {
  try {
    const session = await requireUser();
    const limit = await rateLimitByIp(await getClientIp(), "create_job", 20, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop d'offres publiées récemment. Veuillez réessayer plus tard." };
    }
    const raw = Object.fromEntries(formData.entries());
    const parsed = createJobSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { title, description, city, contractType, salaryInfo, requirements, companyId, employerType } = parsed.data;
    const employerEntityId = parsed.data.employerEntityId || companyId;

    if (!employerEntityId) {
      return { success: false, message: "Sélectionnez une société ou un fournisseur pour publier cette offre." };
    }

    const user = await prisma.user.findFirst({
      where: { id: session.user.id, deletedAt: null },
      include: { profile: true },
    });

    if (!user) {
      return { success: false, message: "Utilisateur introuvable." };
    }

    const entity =
      employerType === "supplier"
        ? await prisma.supplier.findFirst({ where: { id: employerEntityId, deletedAt: null } })
        : await prisma.company.findFirst({ where: { id: employerEntityId, deletedAt: null } });

    if (!entity) {
      return { success: false, message: employerType === "supplier" ? "Fournisseur introuvable." : "Société introuvable." };
    }

    const membership = await requireEntityRole(user.id, employerType, entity.id, ["owner", "recruiter"]);

    if (!canPublishJob(user, entity, membership.role)) {
      return {
        success: false,
        message:
          employerType === "supplier"
            ? "Votre compte personnel et votre fournisseur doivent être validés pour publier une offre."
            : "Votre compte personnel et votre société doivent être validés pour publier une offre.",
      };
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        city,
        contractType,
        salaryMin: salaryInfo && !Number.isNaN(parseInt(salaryInfo, 10)) ? parseInt(salaryInfo, 10) : undefined,
        requiredSkills: requirements || null,
        companyId: employerType === "company" ? entity.id : null,
        employerType,
        employerEntityId: entity.id,
        createdBy: user.id,
        status: "pending",
      },
      include: { company: true },
    });

    // A4 : emails déportés après la réponse (latence Resend hors du temps perçu).
    after(async () => {
      try {
        if (user.email) {
          await sendNewJobNotification(user.email, title);
        }
        await sendAdminNotification(
          "Nouvelle offre d'emploi à modérer",
          `<p><strong>${escapeHtml(title)}</strong> — ${escapeHtml(entity.name)} (${escapeHtml(city)})</p>`
        );
      } catch (mailErr) {
        console.error("createJob notification email failed:", mailErr);
      }
    });

    revalidatePath("/emploi");
    return { success: true, job };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }

    console.error("createJob error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function getPublishedJobs(search?: string, page?: number, limit = 12) {
  const where: Prisma.JobWhereInput = { status: "published", deletedAt: null };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const items = await attachEmployerSummaries(jobs);
  return { items, total, page: currentPage, totalPages };
}

export async function getJobById(id: string) {
  const job = await prisma.job.findUnique({
    where: { id, deletedAt: null },
    include: { company: true, creator: true },
  });

  if (!job) return null;

  const employer = await resolveEmployerSummary(job);
  return {
    ...job,
    employer,
    employerName: employer?.name ?? job.company?.name ?? "Entreprise",
    employerHref: employer?.href ?? (job.company?.id ? `/annuaire/societes/${job.company.slug ?? job.company.id}` : null),
  };
}

const applySchema = z.object({
  jobId: z.string(),
  candidateProfileId: z.string().optional(),
  message: z.string().optional(),
});

export async function applyToJob(formData: FormData) {
  try {
    const session = await requireUser();
    const limit = await rateLimitByIp(await getClientIp(), "apply_job", 30, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de candidatures envoyées récemment. Veuillez réessayer plus tard." };
    }

    // Compte personnel vérifié requis (cohérent avec la publication d'offre) :
    // limite le spam de candidatures par des comptes non vérifiés.
    const account = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, profile: { select: { verificationStatus: true } } },
    });
    if (!account || !(account.emailVerified || account.profile?.verificationStatus === "approved")) {
      return { success: false, message: "Veuillez vérifier votre adresse email avant de postuler." };
    }
    const raw = Object.fromEntries(formData.entries());
    const parsed = applySchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { jobId, candidateProfileId, message } = parsed.data;

    // Tout utilisateur connecté peut postuler : le profil candidat est créé
    // (ou restauré) automatiquement à la première candidature, pré-rempli
    // depuis le compte utilisateur.
    let candidateProfile = await prisma.candidateProfile.findFirst({
      where: { userId: session.user.id, deletedAt: null },
      select: { id: true, userId: true, firstName: true, lastName: true },
    });

    if (!candidateProfile) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true, email: true, phone: true, city: true },
      });
      candidateProfile = await prisma.candidateProfile.upsert({
        where: { userId: session.user.id },
        update: { deletedAt: null },
        create: {
          userId: session.user.id,
          firstName: user?.firstName ?? null,
          lastName: user?.lastName ?? null,
          email: user?.email ?? null,
          phone: user?.phone ?? null,
          city: user?.city ?? null,
        },
        select: { id: true, userId: true, firstName: true, lastName: true },
      });
    }

    if (candidateProfileId && candidateProfileId !== candidateProfile.id) {
      return { success: false, message: "Vous ne pouvez pas postuler avec le profil d'un autre candidat." };
    }

    const job = await prisma.job.findFirst({
      where: { id: jobId, status: "published", deletedAt: null },
      include: { company: { include: { owner: { select: { email: true } } } } },
    });

    if (!job) {
      return { success: false, message: "Offre introuvable ou indisponible." };
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { jobId, candidateProfileId: candidateProfile.id, deletedAt: null },
    });

    if (existing) {
      return { success: false, message: "Vous avez déjà postulé à cette offre." };
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        candidateProfileId: candidateProfile.id,
        applicantUserId: session.user.id,
        message: message || null,
        status: "submitted",
      },
    });

    const candidateName = `${candidateProfile.firstName ?? ""} ${candidateProfile.lastName ?? ""}`.trim() || "Un candidat";
    // A4 : notification email à l'employeur déportée après la réponse.
    after(async () => {
      try {
        const employer = await resolveEmployerSummary(job);
        const toEmail = job?.company?.owner?.email ?? employer?.ownerEmail;
        if (toEmail) {
          await sendJobApplicationNotification(toEmail, candidateName, job.title);
        }
      } catch (mailErr) {
        console.error("applyToJob notification email failed:", mailErr);
      }
    });

    // Notification in-app à l'employeur (propriétaire de la société ou du fournisseur).
    let employerOwnerUserId: string | null = job.company?.ownerUserId ?? null;
    if (!employerOwnerUserId && job.employerType === "supplier" && job.employerEntityId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: job.employerEntityId },
        select: { ownerUserId: true },
      });
      employerOwnerUserId = supplier?.ownerUserId ?? null;
    }
    if (employerOwnerUserId) {
      await notifyUser({
        userId: employerOwnerUserId,
        type: "job_application",
        title: "Nouvelle candidature",
        body: `${candidateName} a postulé à « ${job.title} ».`,
        link: "/dashboard/entreprise/offres",
      });
    }

    revalidatePath("/emploi");
    return { success: true, application };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }

    console.error("applyToJob error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function getCandidateApplications(candidateProfileId: string) {
  const session = await requireUser();

  const candidateProfile = await prisma.candidateProfile.findFirst({
    where: { id: candidateProfileId, deletedAt: null },
    select: { userId: true },
  });

  if (!candidateProfile) {
    throw new PermissionError("NOT_FOUND", "Profil candidat introuvable.");
  }

  const isOwner = candidateProfile.userId === session.user.id;
  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

  if (!isOwner && !isAdmin) {
    throw new PermissionError("FORBIDDEN", "Vous n'avez pas accès à ces candidatures.");
  }

  return prisma.jobApplication.findMany({
    where: { candidateProfileId, deletedAt: null },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getJobsForCurrentPublisher() {
  try {
    const session = await requireUser();
    const userId = session.user.id;
    const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

    const memberships = await prisma.entityMember.findMany({
      where: {
        userId,
        status: "active",
        deletedAt: null,
        entityType: { in: ["company", "supplier"] },
        role: { in: ["owner", "admin", "recruiter"] },
      },
      select: { entityType: true, entityId: true },
    });

    const companyIds = memberships.filter((membership) => membership.entityType === "company").map((membership) => membership.entityId);
    const supplierIds = memberships.filter((membership) => membership.entityType === "supplier").map((membership) => membership.entityId);

    const [legacyCompanies, legacySuppliers] = await Promise.all([
      prisma.company.findMany({ where: { ownerUserId: userId, deletedAt: null }, select: { id: true } }),
      prisma.supplier.findMany({ where: { ownerUserId: userId, deletedAt: null }, select: { id: true } }),
    ]);

    for (const company of legacyCompanies) companyIds.push(company.id);
    for (const supplier of legacySuppliers) supplierIds.push(supplier.id);

    const jobs = await prisma.job.findMany({
      where: isAdmin
        ? { deletedAt: null }
        : {
            deletedAt: null,
            OR: [
              { createdBy: userId },
              { companyId: { in: Array.from(new Set(companyIds)) } },
              { employerType: "supplier", employerEntityId: { in: Array.from(new Set(supplierIds)) } },
            ],
          },
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });

    return attachEmployerSummaries(jobs);
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getJobsForCurrentPublisher error:", err);
    return [];
  }
}

export async function softDeleteJob(jobId: string) {
  try {
    const session = await requireUser();
    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: { companyId: true, employerType: true, employerEntityId: true },
    });

    if (!job) {
      return { success: false, message: "Offre introuvable." };
    }

    const role = session.user.role;
    const isAdmin = role === "admin" || role === "super_admin";

    if (!isAdmin) {
      const entityType = job.employerType === "supplier" ? "supplier" : "company";
      const entityId = job.employerEntityId ?? job.companyId;
      if (!entityId) {
        return { success: false, message: "Employeur introuvable." };
      }
      await requireEntityRole(session.user.id, entityType, entityId, ["owner", "recruiter"]);
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/emploi");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }

    console.error("softDeleteJob error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

const applicationStatusSchema = z.enum(["submitted", "viewed", "interview", "rejected", "hired"]);

export async function getApplicationsForCompany(companyId: string) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    await requireEntityRole(userId, "company", companyId, ["owner", "admin", "recruiter"]);

    const company = await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { verificationStatus: true },
    });

    if (!company || company.verificationStatus !== "approved") {
      return {
        success: false,
        message: "Votre société doit être vérifiée pour accéder aux candidatures.",
      };
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        deletedAt: null,
        job: {
          companyId,
          deletedAt: null,
        },
      },
      include: {
        job: true,
        candidateProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                city: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, applications };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getApplicationsForCompany error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getApplicationsForJob(jobId: string) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: { companyId: true, employerType: true, employerEntityId: true },
    });

    if (!job) {
      return { success: false, message: "Offre introuvable." };
    }

    const entityType = job.employerType === "supplier" ? "supplier" : "company";
    const entityId = job.employerEntityId ?? job.companyId;
    if (!entityId) {
      return { success: false, message: "Employeur introuvable." };
    }

    await requireEntityRole(userId, entityType, entityId, ["owner", "admin", "recruiter"]);

    const employer =
      entityType === "supplier"
        ? await prisma.supplier.findFirst({ where: { id: entityId, deletedAt: null }, select: { verificationStatus: true } })
        : await prisma.company.findFirst({ where: { id: entityId, deletedAt: null }, select: { verificationStatus: true } });

    if (!employer || employer.verificationStatus !== "approved") {
      return {
        success: false,
        message: entityType === "supplier" ? "Votre fournisseur doit être vérifié pour accéder aux candidatures." : "Votre société doit être vérifiée pour accéder aux candidatures.",
      };
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        jobId,
        deletedAt: null,
      },
      include: {
        job: true,
        candidateProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                city: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, applications };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("getApplicationsForJob error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

const updateApplicationStatusSchema = z.object({
  applicationId: z.string(),
  status: applicationStatusSchema,
  internalNotes: z.string().max(5000).optional(),
});

export async function updateApplicationStatus(formData: FormData) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const raw = Object.fromEntries(formData.entries());
    const parsed = updateApplicationStatusSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { applicationId, status, internalNotes } = parsed.data;

    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { job: { select: { companyId: true, employerType: true, employerEntityId: true } } },
    });

    if (!application) {
      return { success: false, message: "Candidature introuvable." };
    }

    const entityType = application.job.employerType === "supplier" ? "supplier" : "company";
    const entityId = application.job.employerEntityId ?? application.job.companyId;
    if (!entityId) {
      return { success: false, message: "Employeur introuvable." };
    }

    await requireEntityRole(userId, entityType, entityId, ["owner", "admin", "recruiter"]);

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        internalNotes: internalNotes ?? application.internalNotes,
      },
    });

    revalidatePath(`/dashboard/entreprise/offres/${application.jobId}/candidatures`);
    return { success: true, application: updated };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateApplicationStatus error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
