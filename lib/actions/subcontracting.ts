"use server";

import { prisma } from "@/lib/prisma";

export async function getPublishedSubcontractingMissions() {
  return prisma.subcontractingMission.findMany({
    where: { status: "published", deletedAt: null },
    include: {
      creator: { select: { firstName: true, lastName: true, email: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
