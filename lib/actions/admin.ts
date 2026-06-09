"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ADMIN_ENTITY_TYPES, WORKFLOW_STATUSES, type AdminEntityType } from "@/lib/types";
import { rateLimitByIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

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
    throw new Error("Forbidden");
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

    switch (entityType) {
      case "company":
        await prisma.company.update({
          where: { id: entityId },
          data: { verificationStatus: status },
        });
        break;
      case "supplier":
        await prisma.supplier.update({
          where: { id: entityId },
          data: { verificationStatus: status },
        });
        break;
      case "job": {
        const jobData: Record<string, unknown> = { status };
        if (status === "published" || status === "approved") {
          jobData.publishedAt = new Date();
        }
        await prisma.job.update({ where: { id: entityId }, data: jobData });
        break;
      }
      case "training": {
        const trainingData: Record<string, unknown> = { status };
        await prisma.training.update({ where: { id: entityId }, data: trainingData });
        break;
      }
      case "article": {
        const articleData: Record<string, unknown> = { status };
        if (status === "published" || status === "approved") {
          articleData.publishedAt = new Date();
        }
        await prisma.article.update({ where: { id: entityId }, data: articleData });
        break;
      }
      case "membership":
        await prisma.associationMembership.update({
          where: { id: entityId },
          data: {
            status,
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            rejectionReason: status === "rejected" ? rejectionReason ?? null : null,
          },
        });
        break;
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
    console.error("updateEntityStatus error:", err);
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
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
  const [companies, suppliers, jobs, trainings, memberships, articles] = await Promise.all([
    prisma.company.findMany({ where: { deletedAt: null }, select: { id: true, name: true, verificationStatus: true } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, select: { id: true, name: true, verificationStatus: true } }),
    prisma.job.findMany({ where: { deletedAt: null }, select: { id: true, title: true, status: true } }),
    prisma.training.findMany({ where: { deletedAt: null }, select: { id: true, title: true, status: true } }),
    prisma.associationMembership.findMany({ select: { id: true, userId: true, status: true } }),
    prisma.article.findMany({ where: { deletedAt: null }, select: { id: true, title: true, status: true } }),
  ]);

  return [
    ...companies.map((c) => ({ id: c.id, entityType: "company" as const, type: "Societe", title: c.name, status: c.verificationStatus })),
    ...suppliers.map((s) => ({ id: s.id, entityType: "supplier" as const, type: "Fournisseur", title: s.name, status: s.verificationStatus })),
    ...jobs.map((j) => ({ id: j.id, entityType: "job" as const, type: "Offre", title: j.title, status: j.status })),
    ...trainings.map((t) => ({ id: t.id, entityType: "training" as const, type: "Formation", title: t.title, status: t.status })),
    ...memberships.map((m) => ({ id: m.id, entityType: "membership" as const, type: "Association", title: m.userId, status: m.status })),
    ...articles.map((a) => ({ id: a.id, entityType: "article" as const, type: "Article", title: a.title, status: a.status })),
  ];
}

export async function exportModerationQueue() {
  const queue = await getAdminQueue();
  const headers = ["Type", "Element", "Statut"];
  const rows = queue.map((item) => [item.type, item.title.replace(/"/g, '""'), item.status]);
  const csv = [headers.join(";"), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(";"))].join("\n");
  return csv;
}
