// Applique les migrations Prisma au déploiement (utilisé par vercel-build).
//
// Cas particulier : la base de production a été créée avant l'adoption de
// Prisma Migrate (pas de table _prisma_migrations), donc `migrate deploy`
// échoue avec P3005. Dans ce cas uniquement, on enregistre la migration
// initiale comme déjà appliquée (baseline) puis on rejoue le deploy pour
// appliquer les migrations suivantes. Toute autre erreur reste bloquante.

import { spawnSync } from "node:child_process";

const INIT_MIGRATION = "20260610000000_init";

function run(cmd) {
  const res = spawnSync(cmd, { shell: true, encoding: "utf8" });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  return res;
}

const first = run("prisma migrate deploy");
if (first.status === 0) process.exit(0);

const output = `${first.stdout ?? ""}\n${first.stderr ?? ""}`;
if (!output.includes("P3005")) process.exit(first.status ?? 1);

console.log(`P3005 détecté — baseline de la migration initiale ${INIT_MIGRATION}...`);
const resolve = run(`prisma migrate resolve --applied ${INIT_MIGRATION}`);
if (resolve.status !== 0) process.exit(resolve.status ?? 1);

const second = run("prisma migrate deploy");
process.exit(second.status ?? 0);
