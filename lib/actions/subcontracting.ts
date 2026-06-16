"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PermissionError, requireUser } from "@/lib/permissions";
import { hasApprovedAssociationMembership } from "@/lib/actions/memberships";
import { notifyUser } from "@/lib/notifications";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { sendSubcontractingApplicationNotification, sendNewMissionNotification } from "@/lib/email";

// Autorise un membre association. La session JWT pouvant être figée (statut accordé
// après le login), on consulte aussi la base pour refléter immédiatement l'approbation.
async function isAssociationAuthorized(user: { id: string; role?: string | null; associationMember?: boolean }) {
  if (user.role === "admin" || user.role === "super_admin" || user.associationMember === true) {
    return true;
  }
  return hasApprovedAssociationMembership(user.id);
}

const createMissionSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères."),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  serviceType: z.string().min(1, "Le type de service est obligatoire."),
  city: z.string().min(1, "La ville est obligatoire."),
  postalCode: z.string().optional(),
  locationDetails: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  durationEstimate: z.string().optional(),
  urgencyLevel: z.string().optional(),
  budgetInfoOptional: z.string().optional(),
  requiredSkills: z.string().optional(),
  requiredDocuments: z.string().optional(),
  requiredEquipment: z.string().optional(),
  peopleNeeded: z.string().optional(),
});

const applySchema = z.object({
  missionId: z.string(),
  message: z.string().max(2000).optional(),
  proposedPriceOptional: z.string().optional(),
  availability: z.string().optional(),
});

export async function getPublishedSubcontractingMissions() {
  try {
    const session = await requireUser();
    const user = session.user;

    const isAuthorized = await isAssociationAuthorized(user);

    if (!isAuthorized) {
      throw new PermissionError("FORBIDDEN", "Accès réservé aux membres de l'association.");
    }

    return prisma.subcontractingMission.findMany({
      where: { status: "published", deletedAt: null },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getPublishedSubcontractingMissions error:", err);
    return [];
  }
}

export async function getSubcontractingMissionById(id: string) {
  try {
    const session = await requireUser();
    const user = session.user;

    const isAuthorized = await isAssociationAuthorized(user);

    if (!isAuthorized) {
      throw new PermissionError("FORBIDDEN", "Accès réservé aux membres de l'association.");
    }

    const mission = await prisma.subcontractingMission.findFirst({
      where: { id, deletedAt: null },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
        applications: {
          include: {
            applicant: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { applications: true } },
      },
    });

    return mission;
  } catch (err) {
    if (err instanceof PermissionError) {
      return null;
    }
    console.error("getSubcontractingMissionById error:", err);
    return null;
  }
}

export async function createSubcontractingMission(formData: FormData) {
  try {
    const session = await requireUser();
    const user = session.user;

    const limit = await rateLimitByIp(await getClientIp(), "create_mission", 15, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de missions publiées récemment. Veuillez réessayer plus tard." };
    }

    const isAuthorized = await isAssociationAuthorized(user);

    if (!isAuthorized) {
      return { success: false, message: "Seuls les membres de l'association peuvent publier une mission." };
    }

    const raw = Object.fromEntries(formData.entries());
    const parsed = createMissionSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;

    const mission = await prisma.subcontractingMission.create({
      data: {
        title: data.title,
        description: data.description,
        serviceType: data.serviceType,
        city: data.city,
        postalCode: data.postalCode || null,
        locationDetails: data.locationDetails || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        durationEstimate: data.durationEstimate || null,
        urgencyLevel: data.urgencyLevel || "normal",
        budgetInfoOptional: data.budgetInfoOptional || null,
        requiredSkills: data.requiredSkills || null,
        requiredDocuments: data.requiredDocuments || null,
        requiredEquipment: data.requiredEquipment || null,
        peopleNeeded: data.peopleNeeded ? parseInt(data.peopleNeeded) || null : null,
        creatorUserId: session.user.id,
        status: "published",
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await sendNewMissionNotification(
      mission.creator.email || "",
      mission.title,
      mission.city || ""
    );

    revalidatePath("/association");
    revalidatePath("/sous-traitance");
    return { success: true, mission };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("createSubcontractingMission error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function applyToSubcontractingMission(formData: FormData) {
  try {
    const session = await requireUser();
    const user = session.user;

    const limit = await rateLimitByIp(await getClientIp(), "apply_mission", 30, 3_600_000);
    if (!limit.success) {
      return { success: false, message: "Trop de candidatures envoyées récemment. Veuillez réessayer plus tard." };
    }

    const isAuthorized = await isAssociationAuthorized(user);

    if (!isAuthorized) {
      return { success: false, message: "Seuls les membres de l'association peuvent candidater." };
    }

    const raw = Object.fromEntries(formData.entries());
    const parsed = applySchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { missionId, message, proposedPriceOptional, availability } = parsed.data;

    const mission = await prisma.subcontractingMission.findFirst({
      where: { id: missionId, deletedAt: null, status: "published" },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!mission) {
      return { success: false, message: "Mission introuvable ou indisponible." };
    }

    if (mission.creatorUserId === session.user.id) {
      return { success: false, message: "Vous ne pouvez pas candidater à votre propre mission." };
    }

    const existing = await prisma.subcontractingApplication.findFirst({
      where: { missionId, applicantUserId: session.user.id },
    });

    if (existing) {
      return { success: false, message: "Vous avez déjà candidaté à cette mission." };
    }

    const application = await prisma.subcontractingApplication.create({
      data: {
        missionId,
        applicantUserId: session.user.id,
        applicantType: "independent",
        message: message || null,
        proposedPriceOptional: proposedPriceOptional || null,
        availability: availability || null,
        status: "submitted",
      },
    });

    const candidateName = `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || "Un membre";

    if (mission.creator.email) {
      await sendSubcontractingApplicationNotification(
        mission.creator.email,
        candidateName,
        mission.title,
        mission.city || ""
      );
    }

    await notifyUser({
      userId: mission.creatorUserId,
      type: "mission_application",
      title: "Nouvelle candidature à votre mission",
      body: `${candidateName} a candidaté à « ${mission.title} ».`,
      link: `/association/missions/${missionId}`,
    });

    revalidatePath("/association");
    revalidatePath("/sous-traitance");
    revalidatePath(`/association/missions/${missionId}`);
    return { success: true, application };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("applyToSubcontractingMission error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function getMySubcontractingMissions() {
  try {
    const session = await requireUser();

    return prisma.subcontractingMission.findMany({
      where: { creatorUserId: session.user.id, deletedAt: null },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getMySubcontractingMissions error:", err);
    return [];
  }
}

export async function getMySubcontractingApplications() {
  try {
    const session = await requireUser();

    return prisma.subcontractingApplication.findMany({
      where: { applicantUserId: session.user.id },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
            city: true,
            serviceType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getMySubcontractingApplications error:", err);
    return [];
  }
}

export async function softDeleteSubcontractingMission(missionId: string) {
  try {
    const session = await requireUser();

    const mission = await prisma.subcontractingMission.findFirst({
      where: { id: missionId, deletedAt: null },
      select: { creatorUserId: true },
    });

    if (!mission) {
      return { success: false, message: "Mission introuvable." };
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";
    if (!isAdmin && mission.creatorUserId !== session.user.id) {
      return { success: false, message: "Vous ne pouvez supprimer que vos propres missions." };
    }

    await prisma.subcontractingMission.update({
      where: { id: missionId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/association");
    revalidatePath("/sous-traitance");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("softDeleteSubcontractingMission error:", err);
    return { success: false, message: "Une erreur est survenue." };
  }
}
