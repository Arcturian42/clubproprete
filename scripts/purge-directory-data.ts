// Purge les données de démonstration des annuaires (sociétés, fournisseurs,
// centres de formation, indépendants, candidats, membres) en conservant une
// liste blanche de profils réels.
//
// Conserve :
//   - l'entité nommée « Paris Éclat » (société ou fournisseur) et son propriétaire ;
//   - les utilisateurs Lucas Mafo, Clément Galbi, Paul Munier (et tout ce qu'ils
//     possèdent : fiches, profils indépendant/candidat, visibilité membre).
//
// Tout le reste des annuaires est soft-deleted (deletedAt) — les fiches et
// profils disparaissent des annuaires sans suppression physique. Les profils
// membres non conservés repassent en visibilité « private ».
//
// Usage :
//   npx tsx scripts/purge-directory-data.ts              → dry-run (liste sans modifier)
//   CONFIRM=true npx tsx scripts/purge-directory-data.ts → purge effective
//
// Nécessite DATABASE_URL (et DIRECT_URL) vers la base ciblée.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Liste blanche (insensible à la casse et aux accents).
const KEEP_ENTITY_NAMES = ["paris eclat"];
const KEEP_USER_FULLNAMES = ["lucas mafo", "clement galbi", "paul munier"];

function norm(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isKeptEntityName(name: string | null): boolean {
  const n = norm(name);
  return KEEP_ENTITY_NAMES.some((keep) => n.includes(keep));
}

function isKeptUserName(firstName: string | null, lastName: string | null): boolean {
  const full = norm(`${firstName ?? ""} ${lastName ?? ""}`);
  const reversed = norm(`${lastName ?? ""} ${firstName ?? ""}`);
  return KEEP_USER_FULLNAMES.includes(full) || KEEP_USER_FULLNAMES.includes(reversed);
}

async function main() {
  const confirm = process.env.CONFIRM === "true";
  const now = new Date();

  // 1. Utilisateurs conservés (par nom) + propriétaires des entités conservées.
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  const keepUserIds = new Set(
    users.filter((u) => isKeptUserName(u.firstName, u.lastName)).map((u) => u.id)
  );

  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, ownerUserId: true },
  });
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, ownerUserId: true },
  });
  const organizations = await prisma.trainingOrganization.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, ownerUserId: true },
  });

  // Le propriétaire d'une entité conservée est lui aussi conservé.
  for (const entity of [...companies, ...suppliers, ...organizations]) {
    if (isKeptEntityName(entity.name)) keepUserIds.add(entity.ownerUserId);
  }

  const keptUsers = users.filter((u) => keepUserIds.has(u.id));

  // 2. Cibles de purge par annuaire.
  const companiesToDelete = companies.filter(
    (c) => !isKeptEntityName(c.name) && !keepUserIds.has(c.ownerUserId)
  );
  const suppliersToDelete = suppliers.filter(
    (s) => !isKeptEntityName(s.name) && !keepUserIds.has(s.ownerUserId)
  );
  const organizationsToDelete = organizations.filter(
    (o) => !isKeptEntityName(o.name) && !keepUserIds.has(o.ownerUserId)
  );

  const independentsToDelete = await prisma.independentProfile.findMany({
    where: { deletedAt: null, userId: { notIn: [...keepUserIds] } },
    select: { id: true, userId: true, businessName: true },
  });
  const candidatesToDelete = await prisma.candidateProfile.findMany({
    where: { deletedAt: null, userId: { notIn: [...keepUserIds] } },
    select: { id: true, userId: true, firstName: true, lastName: true },
  });
  const memberProfilesToHide = await prisma.userProfile.findMany({
    where: { deletedAt: null, visibility: "public", userId: { notIn: [...keepUserIds] } },
    select: { id: true, userId: true },
  });

  // 3. Rapport.
  console.log("À CONSERVER (liste blanche) :");
  for (const u of keptUsers) {
    console.log(`  • ${u.firstName ?? ""} ${u.lastName ?? ""} <${u.email}>`.trim());
  }
  for (const e of [...companies, ...suppliers, ...organizations].filter((x) => isKeptEntityName(x.name))) {
    console.log(`  • [entité] ${e.name}`);
  }

  console.log("\nÀ PURGER :");
  console.log(`  Sociétés ............... ${companiesToDelete.length} / ${companies.length}`);
  console.log(`  Fournisseurs ........... ${suppliersToDelete.length} / ${suppliers.length}`);
  console.log(`  Centres de formation ... ${organizationsToDelete.length} / ${organizations.length}`);
  console.log(`  Profils indépendant .... ${independentsToDelete.length}`);
  console.log(`  Profils candidat ....... ${candidatesToDelete.length}`);
  console.log(`  Membres (→ privé) ...... ${memberProfilesToHide.length}`);

  if (!confirm) {
    console.log("\nDRY-RUN : rien n'a été modifié. Relancez avec CONFIRM=true pour appliquer.");
    return;
  }

  // 4. Application (soft-delete / masquage).
  const [c, s, o, ind, cand, mem] = await prisma.$transaction([
    prisma.company.updateMany({
      where: { id: { in: companiesToDelete.map((x) => x.id) } },
      data: { deletedAt: now },
    }),
    prisma.supplier.updateMany({
      where: { id: { in: suppliersToDelete.map((x) => x.id) } },
      data: { deletedAt: now },
    }),
    prisma.trainingOrganization.updateMany({
      where: { id: { in: organizationsToDelete.map((x) => x.id) } },
      data: { deletedAt: now },
    }),
    prisma.independentProfile.updateMany({
      where: { id: { in: independentsToDelete.map((x) => x.id) } },
      data: { deletedAt: now },
    }),
    prisma.candidateProfile.updateMany({
      where: { id: { in: candidatesToDelete.map((x) => x.id) } },
      data: { deletedAt: now },
    }),
    prisma.userProfile.updateMany({
      where: { id: { in: memberProfilesToHide.map((x) => x.id) } },
      data: { visibility: "private" },
    }),
  ]);

  console.log("\n🗑️  Purge effectuée :");
  console.log(`  Sociétés purgées ............ ${c.count}`);
  console.log(`  Fournisseurs purgés ......... ${s.count}`);
  console.log(`  Centres de formation purgés . ${o.count}`);
  console.log(`  Profils indépendant purgés .. ${ind.count}`);
  console.log(`  Profils candidat purgés ..... ${cand.count}`);
  console.log(`  Membres passés en privé ..... ${mem.count}`);
}

main()
  .catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
