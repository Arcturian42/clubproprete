// Crée (ou met à niveau) le compte super admin de bootstrap.
//
// Le super admin ne peut pas être créé depuis l'UI (qui exige déjà ce rôle) :
// ce script garantit qu'un compte donné existe, possède un mot de passe valide,
// l'email vérifié, le statut actif et le rôle « super_admin ». Il est idempotent.
//
// Usage :
//   npx tsx scripts/ensure-super-admin.ts                              → dry-run sur le compte par défaut
//   CONFIRM=true npx tsx scripts/ensure-super-admin.ts                 → applique
//   CONFIRM=true npx tsx scripts/ensure-super-admin.ts <email> <pass>  → applique sur un compte précis
//
// Nécessite DATABASE_URL (et DIRECT_URL) pointant vers la base ciblée.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_EMAIL = "clement@pershingsolution.com";
const DEFAULT_PASSWORD = "Password*";

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);
  const email = (emailArg ?? DEFAULT_EMAIL).trim().toLowerCase();
  const password = passwordArg ?? DEFAULT_PASSWORD;
  const confirmed = process.env.CONFIRM === "true";

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, mainRole: true, status: true, emailVerified: true, deletedAt: true },
  });

  if (!confirmed) {
    console.log("DRY-RUN (aucune modification). Relancez avec CONFIRM=true pour appliquer.\n");
    if (existing) {
      console.log(`  ${email} existe → rôle ${existing.mainRole} ⇒ super_admin, mot de passe réinitialisé, email vérifié, statut actif.`);
    } else {
      console.log(`  ${email} sera créé avec le rôle super_admin (email vérifié, statut actif).`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      mainRole: "super_admin",
      status: "active",
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      email,
      passwordHash,
      mainRole: "super_admin",
      status: "active",
      emailVerified: true,
      firstName: "Super",
      lastName: "Admin",
    },
    select: { id: true, email: true },
  });

  console.log(`✓ Super admin prêt : ${user.email} (id ${user.id}). Connexion possible avec le mot de passe fourni.`);
}

main()
  .catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
