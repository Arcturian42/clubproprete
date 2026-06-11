import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Garantit que chaque utilisateur possède un UserProfile : sans lui, la page
 * /membres/[id] renvoie un 404 et l'utilisateur n'apparaît nulle part.
 *
 * - Crée le profil manquant en visibilité "public" (la promesse produit :
 *   tout membre a un profil consultable), sauf pour les chercheurs d'emploi
 *   qui restent privés par défaut (protection des candidats).
 */
async function main() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null, profile: null },
    select: { id: true, email: true, mainRole: true },
  });

  if (users.length === 0) {
    console.log("✅ Tous les utilisateurs ont déjà un UserProfile.");
    return;
  }

  for (const user of users) {
    const isJobSeeker = user.mainRole === "candidate_profile";
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        profileType: user.mainRole,
        visibility: isJobSeeker ? "private" : "public",
        verificationStatus: "draft",
        associationStatus: "not_applicable",
        completionScore: 15,
      },
    });
    console.log(
      `✅ Profil créé pour ${user.email} (${user.mainRole}, ${isJobSeeker ? "privé" : "public"})`
    );
  }

  console.log(`\n${users.length} profil(s) créé(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
