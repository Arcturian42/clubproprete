"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendNewJobNotification, sendAdminNotification, sendJobApplicationNotification } from "@/lib/email";

const createJobSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères."),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  city: z.string().min(1, "La ville est obligatoire."),
  contractType: z.string().min(1, "Le type de contrat est obligatoire."),
  salaryInfo: z.string().optional(),
  requirements: z.string().optional(),
  companyId: z.string().min(1),
  createdBy: z.string().min(1),
});

export async function createJob(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = createJobSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { title, description, city, contractType, salaryInfo, requirements, companyId, createdBy } =
      parsed.data;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        city,
        contractType,
        salaryMin: salaryInfo ? parseInt(salaryInfo) || undefined : undefined,
        requiredSkills: requirements || null,
        companyId,
        createdBy,
        status: "pending",
      },
      include: { company: true },
    });

    const creator = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { email: true, firstName: true },
    });

    if (creator?.email) {
      await sendNewJobNotification(creator.email, title);
    }

    await sendAdminNotification(
      "Nouvelle offre d'emploi à modérer",
      `<p><strong>${title}</strong> — ${job.company?.name ?? "Société inconnue"} (${city})</p>`
    );

    revalidatePath("/emploi");
    return { success: true, job };
  } catch (err) {
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
  candidateProfileId: z.string(),
  message: z.string().optional(),
});

export async function applyToJob(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = applySchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { jobId, candidateProfileId, message } = parsed.data;

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      select: { userId: true, firstName: true, lastName: true },
    });

    if (!candidateProfile) {
      return { success: false, message: "Profil candidat introuvable." };
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { jobId, candidateProfileId, deletedAt: null },
    });

    if (existing) {
      return { success: false, message: "Vous avez déjà postulé à cette offre." };
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        candidateProfileId,
        applicantUserId: candidateProfile.userId,
        message: message || null,
        status: "submitted",
      },
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: { include: { owner: { select: { email: true } } } } },
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
    await prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/emploi");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("softDeleteJob error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
