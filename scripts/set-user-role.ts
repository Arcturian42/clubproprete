// Attribue un rôle plateforme (mainRole) à un utilisateur existant, par email.
// Sert notamment à promouvoir un compte en super_admin (bootstrap : le premier
// super_admin ne peut pas être créé depuis l'UI, qui exige déjà ce rôle).
//
// Usage :
//   npx tsx scripts/set-user-role.ts <email> <role>              → dry-run (affiche sans modifier)
//   CONFIRM=true npx tsx scripts/set-user-role.ts <email> <role> → applique la modification
//
// Exemple :
//   CONFIRM=true npx tsx scripts/set-user-role.ts clement@pershingsolution.com super_admin
//
// Nécessite DATABASE_URL (et DIRECT_URL) pointant vers la base ciblée.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mêmes rôles que lib/actions/users.ts (source de vérité des rôles plateforme).
const ROLES = [
  "registered_user",
  "company_owner",
  "verified_company",
  "supplier_owner",
  "verified_supplier",
  "independent_profile",
  "candidate_profile",
  "training_organization",
  "author",
  "association_member",
  "admin",
  "super_admin",
] as const;

type Role = (typeof ROLES)[number];

async function main() {
  const [emailArg, roleArg] = process.argv.slice(2);

  if (!emailArg || !roleArg) {
    console.error("Usage : npx tsx scripts/set-user-role.ts <email> <role>");
    console.error(`Rôles valides : ${ROLES.join(", ")}`);
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const role = roleArg.trim() as Role;

  if (!ROLES.includes(role)) {
    console.error(`Rôle invalide : « ${roleArg} ».`);
    console.error(`Rôles valides : ${ROLES.join(", ")}`);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true, lastName: true, mainRole: true },
  });

  if (!user) {
    console.error(`Aucun utilisateur trouvé avec l'email « ${email} ».`);
    process.exit(1);
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "(sans nom)";

  if (user.mainRole === role) {
    console.log(`✓ ${user.email} (${fullName}) a déjà le rôle « ${role} ». Rien à faire.`);
    return;
  }

  const confirmed = process.env.CONFIRM === "true";

  if (!confirmed) {
    console.log("DRY-RUN (aucune modification). Relancez avec CONFIRM=true pour appliquer.\n");
    console.log(`  ${user.email} (${fullName}) : ${user.mainRole} → ${role}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mainRole: role },
  });

  console.log(`✓ ${user.email} (${fullName}) : ${user.mainRole} → ${role}`);
}

main()
  .catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
