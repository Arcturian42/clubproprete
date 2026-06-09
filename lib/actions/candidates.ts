"use server";

import { prisma } from "@/lib/prisma";
import { canViewCandidate, PermissionError, requireUser } from "@/lib/permissions";

export async function getPublishedCandidates(page?: number, limit = 12) {
  const currentPage = Math.max(1, page ?? 1);

  return {
    items: [],
    total: 0,
    page: currentPage,
    totalPages: 0,
    limit,
  };
}

export async function getCandidateProfileForViewer(candidateUserId: string) {
  const session = await requireUser();
  const canView = await canViewCandidate(
    { id: session.user.id, role: session.user.role },
    candidateUserId
  );

  if (!canView) {
    throw new PermissionError("FORBIDDEN", "Vous n'avez pas accès à ce profil candidat.");
  }

  return prisma.candidateProfile.findFirst({
    where: { userId: candidateUserId, deletedAt: null },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          city: true,
          avatarUrl: true,
        },
      },
    },
  });
}
