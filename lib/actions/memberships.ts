"use server";

import { prisma } from "@/lib/prisma";

export async function getApprovedMemberships() {
  return prisma.associationMembership.findMany({
    where: { status: "approved" },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}
