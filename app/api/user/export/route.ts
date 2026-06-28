import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Export RGPD des données de l'utilisateur courant.
 *
 * Sécurité / minimisation des données (S2 — RGPD art. 5(1)(c)) : on ne retourne
 * QUE les données appartenant en propre à l'utilisateur demandeur. On exclut
 * délibérément les relations qui contiennent des données sur d'AUTRES personnes
 * (notifications avec expéditeurs, recommandations reçues/données avec l'auteur,
 * candidatures reçues, etc.) ainsi que les secrets (passwordHash, 2FA, tokens).
 * Un `select` explicite (liste blanche) est utilisé plutôt qu'un `include`, afin
 * qu'aucune relation ne fuite par défaut si le schéma évolue.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findFirst({
    // Un compte supprimé (soft-delete) ne doit plus pouvoir exporter ses données,
    // même avec un JWT encore valide ; ses données ont par ailleurs été anonymisées.
    where: { id: userId, deletedAt: null },
    select: {
      // Champs scalaires du compte (hors secrets).
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      bio: true,
      address: true,
      city: true,
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      mainRole: true,
      status: true,
      newsletterOptIn: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      createdAt: true,
      updatedAt: true,
      // Profil personnel et fiches que l'utilisateur possède.
      profile: true,
      companies: { where: { deletedAt: null } },
      suppliers: { where: { deletedAt: null } },
      independentProfile: true,
      candidateProfile: true,
      trainingOrganizations: { where: { deletedAt: null } },
      trainings: { where: { deletedAt: null } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(user, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mes-donnees-${userId}.json"`,
    },
  });
}
