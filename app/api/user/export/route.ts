import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      companies: true,
      suppliers: true,
      independentProfile: true,
      candidateProfile: {
        include: {
          applications: {
            include: { job: true },
          },
        },
      },
      trainingOrganizations: true,
      trainings: true,
      memberships: true,
      entityMemberships: true,
      articles: true,
      recommendationsReceived: true,
      recommendationsGiven: true,
      subcontractingMissions: true,
      subcontractingResponses: true,
      notifications: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Exclure les champs sensibles
  const { passwordHash, ...safeUser } = user;

  return NextResponse.json(safeUser, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mes-donnees-${userId}.json"`,
    },
  });
}
