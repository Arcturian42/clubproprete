"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendNewJobNotification, sendAdminNotification, sendJobApplicationNotification } from "@/lib/email";
import { canPublishJob, PermissionError, requireEntityRole, requireUser } from "@/lib/permissions";

const createJobSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères."),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  city: z.string().min(1, "La ville est obligatoire."),
  contractType: z.string().min(1, "Le type de contrat est obligatoire."),
  salaryInfo: z.string().optional(),
  requirements: z.string().optional(),
  companyId: z.string().min(1),
});

export async function createJob(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = createJobSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { title, description, city, contractType, salaryInfo, requirements, companyId } = parsed.data;

    const [user, company] = await Promise.all([
      prisma.user.findFirst({
        where: { id: session.user.id, deletedAt: null },
        include: { profile: true },
      }),
      prisma.company.findFirst({
        where: { id: companyId, deletedAt: null },
      }),
    ]);

    if (!user) {
      return { success: false, message: "Utilisateur introuvable." };
    }

    if (!company) {
      return { success: false, message: "Société introuvable." };
    }

    const membership = await requireEntityRole(user.id, "company", company.id, ["owner", "recruiter"]);

    if (!canPublishJob(user, company, membership.role)) {
      return {
        success: false,
        message: "Votre compte personnel et votre société doivent être validés pour publier une offre.",
      };
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        city,
        contractType,
        salaryMin: salaryInfo ? parseInt(salaryInfo) || undefined : undefined,
        requiredSkills: requirements || null,
        companyId,
        createdBy: user.id,
        status: "pending",
      },
      include: { company: true },
    });

    if (user.email) {
      await sendNewJobNotification(user.email, title);
    }

    await sendAdminNotification(
      "Nouvelle offre d'emploi à modérer",
      `<p><strong>${title}</strong> — ${job.company?.name ?? "Société inconnue"} (${city})</p>`
    );

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
  const where: Record<string, unknown> = { status: "published", deletedAt: null };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { city: { contains: search } },
    ];
  }

  const currentPage = Math.max(1, page ?? 1);
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
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
  return { items, total, page: currentPage, totalPages };
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id, deletedAt: null },
    include: { company: true, creator: true },
  });
}

const applySchema = z.object({
  jobId: z.string(),
  candidateProfileId: z.string().optional(),
  message: z.string().optional(),
});

export async function applyToJob(formData: FormData) {
  try {
    const session = await requireUser();
    const raw = Object.fromEntries(formData.entries());
    const parsed = applySchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { jobId, candidateProfileId, message } = parsed.data;

    const candidateProfile = await prisma.candidateProfile.findFirst({
      where: { userId: session.user.id, deletedAt: null },
      select: { id: true, userId: true, firstName: true, lastName: true },
    });

    if (!candidateProfile) {
      return { success: false, message: "Vous devez disposer d'un profil candidat pour postuler." };
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

    const toEmail = job?.company?.owner?.email;
    if (toEmail) {
      await sendJobApplicationNotification(
        toEmail,
        `${candidateProfile.firstName ?? ""} ${candidateProfile.lastName ?? ""}`.trim() || "Un candidat",
        job.title
      );
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
  return prisma.jobApplication.findMany({
    where: { candidateProfileId, deletedAt: null },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function softDeleteJob(jobId: string) {
  try {
    const session = await requireUser();
    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: { companyId: true },
    });

    if (!job) {
      return { success: false, message: "Offre introuvable." };
    }

    const role = session.user.role;
    const isAdmin = role === "admin" || role === "super_admin";

    if (!isAdmin) {
      await requireEntityRole(session.user.id, "company", job.companyId, ["owner", "recruiter"]);
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
