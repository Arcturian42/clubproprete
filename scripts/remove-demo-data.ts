// Purge les données de démonstration d'une base (comptes *@clubproprete.test
// et tout ce qui leur appartient via les cascades : sociétés, fournisseurs,
// offres, formations, missions, articles…).
//
// Usage :
//   npx tsx scripts/remove-demo-data.ts            → dry-run (liste sans supprimer)
//   CONFIRM=true npx tsx scripts/remove-demo-data.ts → suppression effective

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL_SUFFIX = "@clubproprete.test";

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
    select: { id: true, email: true, mainRole: true },
  });

  if (demoUsers.length === 0) {
    console.log("✅ Aucun compte de démo trouvé : la base est propre.");
    return;
  }

  console.log(`Comptes de démo trouvés (${demoUsers.length}) :`);
  for (const user of demoUsers) {
    console.log(`  - ${user.email} (${user.mainRole})`);
  }

  if (process.env.CONFIRM !== "true") {
    console.log(
      "\nDry-run : rien n'a été supprimé. Relancez avec CONFIRM=true pour purger " +
        "ces comptes et toutes leurs données (cascade)."
    );
    return;
  }

  const result = await prisma.user.deleteMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
  });
  console.log(`\n🗑️  ${result.count} compte(s) de démo supprimé(s), données associées purgées en cascade.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
