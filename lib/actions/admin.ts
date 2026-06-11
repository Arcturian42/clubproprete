"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ADMIN_ENTITY_TYPES, WORKFLOW_STATUSES, type AdminEntityType } from "@/lib/types";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { PermissionError } from "@/lib/permissions";
import { notifyUser, type NotificationInput } from "@/lib/notifications";

function decisionLabel(status: string) {
  if (status === "approved" || status === "published") return "validé(e)";
  if (status === "rejected") return "refusé(e)";
  if (status === "archived") return "archivé(e)";
  if (status === "suspended") return "suspendu(e)";
  return status;
}

const updateStatusSchema = z.object({
  entityType: z.enum(ADMIN_ENTITY_TYPES),
  entityId: z.string(),
  status: z.enum(WORKFLOW_STATUSES),
  rejectionReason: z.string().max(500).optional(),
});

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "super_admin") {
    throw new PermissionError("FORBIDDEN", "Accès réservé aux administrateurs.");
  }
  return session!.user;
}

export async function updateEntityStatus(formData: FormData) {
  try {
    const ip = await getClientIp();
    const limit = rateLimitByIp(ip, "admin_action", 30, 60_000);
    if (!limit.success) {
      return { success: false, message: "Trop d'actions. Veuillez ralentir." };
    }
    const admin = await requireAdmin();
    const raw = Object.fromEntries(formData.entries());
    const parsed = updateStatusSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { entityType, entityId, status, rejectionReason } = parsed.data;

    // Vérifier que l'entité existe avant modification
    const entityExists = await checkEntityExists(entityType, entityId);
    if (!entityExists) {
      return { success: false, message: "Entité introuvable." };
    }

    // Notification in-app destinée au propriétaire/demandeur concerné par la décision.
    let notify: NotificationInput | null = null;
    const reasonSuffix = status === "rejected" && rejectionReason ? ` Motif : ${rejectionReason}` : "";

    switch (entityType) {
      case "company": {
        const company = await prisma.company.update({
          where: { id: entityId },
          data: { verificationStatus: status },
        });
        // Clôt la demande de vérification associée (RDV + questionnaire) :
        // la décision admin porte sur cette demande.
        await prisma.verificationRequest.updateMany({
          where: { entityType: "company", entityId, status: "pending" },
          data: {
            status: status === "approved" ? "approved" : "rejected",
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            rejectionReason: status === "rejected" ? rejectionReason ?? null : null,
          },
        });
        notify = {
          userId: company.ownerUserId,
          type: "moderation",
          title:
            status === "approved"
              ? "Fiche vérifiée ✓"
              : `Demande de vérification ${decisionLabel(status)}`,
          body:
            status === "approved"
              ? `Votre fiche « ${company.name} » est désormais vérifiée : le badge est visible sur l'annuaire.`
              : `Votre demande de vérification pour « ${company.name} » a été ${decisionLabel(status)}.${reasonSuffix} Votre fiche reste visible dans l'annuaire.`,
          link: status === "approved" ? `/annuaire/societes/${company.id}` : "/dashboard/entreprise",
        };
        break;
      }
      case "supplier": {
        const supplier = await prisma.supplier.update({
          where: { id: entityId },
          data: { verificationStatus: status },
        });
        notify = {
          userId: supplier.ownerUserId,
          type: "moderation",
          title: `Fournisseur ${decisionLabel(status)}`,
          body: `Votre fiche « ${supplier.name} » a été ${decisionLabel(status)}.${reasonSuffix}`,
          link: status === "approved" ? `/annuaire/fournisseurs/${supplier.id}` : "/dashboard/fournisseur",
        };
        break;
      }
      case "training_organization": {
        const organization = await prisma.trainingOrganization.update({
          where: { id: entityId },
          data: { verificationStatus: status },
        });
        notify = {
          userId: organization.ownerUserId,
          type: "moderation",
          title: `Centre de formation ${decisionLabel(status)}`,
          body: `Votre fiche « ${organization.name} » a été ${decisionLabel(status)}.${reasonSuffix}`,
          link: status === "approved" ? `/annuaire/centres-formation/${organization.id}` : "/dashboard/centre-formation",
        };
        break;
      }
      case "job": {
        const jobStatus = status === "approved" ? "published" : status;
        const jobData: Record<string, unknown> = { status: jobStatus };
        if (jobStatus === "published") {
          jobData.publishedAt = new Date();
        }
        const job = await prisma.job.update({ where: { id: entityId }, data: jobData });
        notify = {
          userId: job.createdBy,
          type: "moderation",
          title: `Offre ${decisionLabel(jobStatus)}`,
          body: `Votre offre « ${job.title} » a été ${decisionLabel(jobStatus)}.${reasonSuffix}`,
          link: jobStatus === "published" ? `/emploi/${job.id}` : "/dashboard/entreprise/offres",
        };
        break;
      }
      case "training": {
        const trainingData: Record<string, unknown> = { status };
        const training = await prisma.training.update({ where: { id: entityId }, data: trainingData });
        notify = {
          userId: training.creatorUserId,
          type: "moderation",
          title: `Formation ${decisionLabel(status)}`,
          body: `Votre formation « ${training.title} » a été ${decisionLabel(status)}.${reasonSuffix}`,
          link: status === "approved" ? `/formations/${training.id}` : "/formations/nouvelle",
        };
        break;
      }
      case "article": {
        const articleStatus = status === "approved" ? "published" : status;
        const articleData: Record<string, unknown> = { status: articleStatus };
        if (articleStatus === "published") {
          articleData.publishedAt = new Date();
        }
        const article = await prisma.article.update({ where: { id: entityId }, data: articleData });
        notify = {
          userId: article.authorId,
          type: "moderation",
          title: `Article ${decisionLabel(articleStatus)}`,
          body: `Votre article « ${article.title} » a été ${decisionLabel(articleStatus)}.${reasonSuffix}`,
          link: articleStatus === "published" ? `/ressources/${article.id}` : "/dashboard/auteur",
        };
        break;
      }
      case "author_application": {
        const applicationStatus = status === "approved" ? "approved" : status;
        const application = await prisma.authorApplication.update({
          where: { id: entityId },
          data: {
            status: applicationStatus,
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            rejectionReason: applicationStatus === "rejected" ? rejectionReason ?? null : null,
          },
          include: { article: true },
        });

        if (application.articleId) {
          const articleStatus = applicationStatus === "approved" ? "published" : applicationStatus;
          await prisma.article.update({
            where: { id: application.articleId },
            data: {
              status: articleStatus,
              publishedAt: articleStatus === "published" ? new Date() : application.article?.publishedAt ?? null,
            },
          });
        }

        // Élève un compte générique au rôle auteur pour que son dashboard ouvre le panel
        // de rédaction. Les rôles structurels (société, fournisseur…) sont préservés :
        // l'accès auteur reste porté par la demande approuvée (hasAuthorAccess).
        if (applicationStatus === "approved") {
          await prisma.user.updateMany({
            where: { id: application.userId, mainRole: "registered_user" },
            data: { mainRole: "author" },
          });
        }

        notify = {
          userId: application.userId,
          type: "moderation",
          title: `Demande auteur ${decisionLabel(applicationStatus)}`,
          body:
            applicationStatus === "approved"
              ? "Votre accès auteur est validé : votre premier article est publié et votre espace rédaction est ouvert."
              : `Votre demande auteur a été ${decisionLabel(applicationStatus)}.${reasonSuffix}`,
          link: "/dashboard/auteur",
        };
        break;
      }
      case "membership": {
        const membership = await prisma.associationMembership.update({
          where: { id: entityId },
          data: {
            status,
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            rejectionReason: status === "rejected" ? rejectionReason ?? null : null,
          },
        });
        await prisma.userProfile.updateMany({
          where: { userId: membership.userId },
          data: { associationStatus: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending" },
        });
        await prisma.independentProfile.updateMany({
          where: { userId: membership.userId },
          data: { associationStatus: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending" },
        });
        if (membership.entityType === "company" && membership.entityId) {
          await prisma.company.updateMany({
            where: { id: membership.entityId },
            data: { associationMember: status === "approved" },
          });
        }

        notify = {
          userId: membership.userId,
          type: "moderation",
          title: `Adhésion association ${decisionLabel(status)}`,
          body:
            status === "approved"
              ? "Votre adhésion à l'association est validée : votre espace membre est désormais accessible."
              : `Votre demande d'adhésion a été ${decisionLabel(status)}.${reasonSuffix}`,
          link: "/association",
        };
        break;
      }
    }

    if (notify) {
      await notifyUser(notify);
    }

    await prisma.analyticsEvent.create({
      data: {
        userId: admin.id,
        eventName: "admin.update_status",
        entityType,
        entityId,
        metadata: JSON.stringify({ status, rejectionReason: rejectionReason ?? null }),
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof PermissionError) {
      return { success: false, message: err.message };
    }
    console.error("updateEntityStatus error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}

async function checkEntityExists(entityType: AdminEntityType, entityId: string): Promise<boolean> {
  switch (entityType) {
    case "company":
      return (await prisma.company.count({ where: { id: entityId, deletedAt: null } })) > 0;
    case "supplier":
      return (await prisma.supplier.count({ where: { id: entityId, deletedAt: null } })) > 0;
    case "training_organization":
      return (await prisma.trainingOrganization.count({ where: { id: entityId, deletedAt: null } })) > 0;
    case "job":
      return (await prisma.job.count({ where: { id: entityId, deletedAt: null } })) > 0;
    case "training":
      return (await prisma.training.count({ where: { id: entityId, deletedAt: null } })) > 0;
    case "article":
      return (await prisma.article.count({ where: { id: entityId, deletedAt: null } })) > 0;
    case "author_application":
      return (await prisma.authorApplication.count({ where: { id: entityId } })) > 0;
    case "membership":
      return (await prisma.associationMembership.count({ where: { id: entityId } })) > 0;
    default:
      return false;
  }
}

type QueueItem = {
  id: string;
  entityType: AdminEntityType;
  type: string;
  title: string;
  status: string;
};

export async function getAdminQueue(): Promise<QueueItem[]> {
  try {
    await requireAdmin();

    // Les sociétés ne passent plus par cette file : leurs fiches sont publiées
    // immédiatement et les demandes de vérification ont leur section dédiée
    // (getPendingVerificationRequests) avec questionnaire et créneau de RDV.
    const [suppliers, trainingOrganizations, jobs, trainings, memberships, articles, authorApplications] = await Promise.all([
      prisma.supplier.findMany({
        where: { deletedAt: null, verificationStatus: { in: ["pending", "draft", "rejected"] } },
        select: { id: true, name: true, verificationStatus: true },
      }),
      prisma.trainingOrganization.findMany({
        where: { deletedAt: null, verificationStatus: { in: ["pending", "draft", "rejected"] } },
        select: { id: true, name: true, verificationStatus: true },
      }),
      prisma.job.findMany({
        where: { deletedAt: null, status: { in: ["pending", "draft", "rejected"] } },
        select: { id: true, title: true, status: true },
      }),
      prisma.training.findMany({
        where: { deletedAt: null, status: { in: ["pending", "draft", "rejected"] } },
        select: { id: true, title: true, status: true },
      }),
      prisma.associationMembership.findMany({
        where: { status: { in: ["pending", "draft", "rejected"] } },
        select: { id: true, userId: true, status: true },
      }),
      prisma.article.findMany({
        // Exclut les premiers articles liés à une demande auteur : ils sont déjà
        // modérés via la ligne "Demande auteur" (évite un doublon dans la file).
        where: { deletedAt: null, status: { in: ["pending", "draft", "rejected"] }, authorApplication: { is: null } },
        select: { id: true, title: true, status: true },
      }),
      prisma.authorApplication.findMany({
        where: { status: { in: ["pending", "draft", "rejected"] } },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          article: { select: { title: true } },
        },
      }),
    ]);

    return [
      ...suppliers.map((s) => ({ id: s.id, entityType: "supplier" as const, type: "Fournisseur", title: s.name, status: s.verificationStatus })),
      ...trainingOrganizations.map((organization) => ({
        id: organization.id,
        entityType: "training_organization" as const,
        type: "Centre formation",
        title: organization.name,
        status: organization.verificationStatus,
      })),
      ...jobs.map((j) => ({ id: j.id, entityType: "job" as const, type: "Offre", title: j.title, status: j.status })),
      ...trainings.map((t) => ({ id: t.id, entityType: "training" as const, type: "Formation", title: t.title, status: t.status })),
      ...memberships.map((m) => ({ id: m.id, entityType: "membership" as const, type: "Association", title: `Adhésion ${m.userId.slice(0, 8)}...`, status: m.status })),
      ...articles.map((a) => ({ id: a.id, entityType: "article" as const, type: "Article", title: a.title, status: a.status })),
      ...authorApplications.map((application) => ({
        id: application.id,
        entityType: "author_application" as const,
        type: "Demande auteur",
        title:
          application.article?.title ??
          `${application.user.firstName ?? ""} ${application.user.lastName ?? ""}`.trim() ??
          application.user.email,
        status: application.status,
      })),
    ];
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getAdminQueue error:", err);
    return [];
  }
}

export async function getPendingJobsForModeration() {
  try {
    await requireAdmin();

    const jobs = await prisma.job.findMany({
      where: {
        deletedAt: null,
        OR: [{ status: "pending" }, { status: "draft" }],
      },
      include: {
        company: { select: { id: true, name: true, verificationStatus: true } },
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const supplierIds = Array.from(
      new Set(jobs.filter((job) => job.employerType === "supplier" && job.employerEntityId).map((job) => job.employerEntityId as string))
    );
    const suppliers = supplierIds.length
      ? await prisma.supplier.findMany({
          where: { id: { in: supplierIds } },
          select: { id: true, name: true, verificationStatus: true },
        })
      : [];
    const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

    return jobs.map((job) => {
      const supplier = job.employerType === "supplier" && job.employerEntityId ? supplierById.get(job.employerEntityId) : null;
      return {
        ...job,
        employerName: supplier?.name ?? job.company?.name ?? "—",
        employerStatus: supplier?.verificationStatus ?? job.company?.verificationStatus ?? "unknown",
      };
    });
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getPendingJobsForModeration error:", err);
    return [];
  }
}

/**
 * Demandes de vérification de fiche en attente, avec le questionnaire et le
 * créneau de rendez-vous souhaité : c'est sur cette base que l'admin planifie
 * l'entretien puis valide ou refuse le badge.
 */
export async function getPendingVerificationRequests() {
  try {
    await requireAdmin();

    const requests = await prisma.verificationRequest.findMany({
      where: { status: "pending" },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const companyIds = requests
      .filter((request) => request.entityType === "company")
      .map((request) => request.entityId);
    const companies = companyIds.length
      ? await prisma.company.findMany({
          where: { id: { in: companyIds } },
          select: { id: true, name: true, city: true, siret: true },
        })
      : [];
    const companyById = new Map(companies.map((company) => [company.id, company]));

    return requests.map((request) => ({
      ...request,
      entityName: companyById.get(request.entityId)?.name ?? "—",
      entityCity: companyById.get(request.entityId)?.city ?? null,
      entitySiret: companyById.get(request.entityId)?.siret ?? null,
    }));
  } catch (err) {
    if (err instanceof PermissionError) {
      return [];
    }
    console.error("getPendingVerificationRequests error:", err);
    return [];
  }
}

export async function exportModerationQueue() {
  try {
    await requireAdmin();

    const queue = await getAdminQueue();
    const headers = ["Type", "Élément", "Statut"];
    const rows = queue.map((item) => [item.type, item.title.replace(/"/g, '""'), item.status]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(";"))].join("\n");
    return csv;
  } catch (err) {
    if (err instanceof PermissionError) {
      return "Type;Élément;Statut\n";
    }
    console.error("exportModerationQueue error:", err);
    return "Type;Élément;Statut\n";
  }
}
