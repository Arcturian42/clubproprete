// Répare les accents manquants dans les données existantes de la base
// (anciennes données saisies/seedées sans accents : régions, noms de
// sociétés, intitulés d'offres). Le seed actuel est correct ; ce script
// corrige uniquement les enregistrements déjà en base.
//
// Usage :
//   npx tsx scripts/fix-data-accents.ts              → dry-run (liste sans modifier)
//   CONFIRM=true npx tsx scripts/fix-data-accents.ts → correction effective

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Libellés de régions sans accents → libellés officiels.
const REGION_FIXES: Record<string, string> = {
  "Provence-Alpes-Cote d'Azur": "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhone-Alpes": "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comte": "Bourgogne-Franche-Comté",
  "Ile-de-France": "Île-de-France",
};

// Corrections ciblées de texte (noms propres, intitulés).
const TEXT_FIXES: Array<[string, string]> = [
  ["Proprete", "Propreté"],
  ["d'equipe", "d'équipe"],
  ["D'equipe", "D'équipe"],
];

function applyTextFixes(value: string): string {
  return TEXT_FIXES.reduce((acc, [from, to]) => acc.split(from).join(to), value);
}

const confirm = process.env.CONFIRM === "true";
let plannedChanges = 0;

function logChange(model: string, id: string, field: string, from: string, to: string) {
  plannedChanges += 1;
  console.log(`  [${model}#${id}] ${field}: "${from}" → "${to}"`);
}

async function fixRegions() {
  const models = [
    { name: "UserProfile", delegate: prisma.userProfile },
    { name: "Company", delegate: prisma.company },
    { name: "IndependentProfile", delegate: prisma.independentProfile },
    { name: "NewsletterSubscriber", delegate: prisma.newsletterSubscriber },
  ] as const;

  for (const { name, delegate } of models) {
    for (const [from, to] of Object.entries(REGION_FIXES)) {
      const rows = await (delegate as { findMany: (args: object) => Promise<Array<{ id: string }>> }).findMany({
        where: { region: from },
        select: { id: true },
      });
      for (const row of rows) {
        logChange(name, row.id, "region", from, to);
      }
      if (confirm && rows.length > 0) {
        await (delegate as { updateMany: (args: object) => Promise<unknown> }).updateMany({
          where: { region: from },
          data: { region: to },
        });
      }
    }
  }
}

async function fixCompanyNames() {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true, legalName: true },
  });
  for (const company of companies) {
    const data: Record<string, string> = {};
    const fixedName = applyTextFixes(company.name);
    if (fixedName !== company.name) {
      data.name = fixedName;
      logChange("Company", company.id, "name", company.name, fixedName);
    }
    if (company.legalName) {
      const fixedLegal = applyTextFixes(company.legalName);
      if (fixedLegal !== company.legalName) {
        data.legalName = fixedLegal;
        logChange("Company", company.id, "legalName", company.legalName, fixedLegal);
      }
    }
    if (confirm && Object.keys(data).length > 0) {
      await prisma.company.update({ where: { id: company.id }, data });
    }
  }
}

async function fixJobTitles() {
  const jobs = await prisma.job.findMany({ select: { id: true, title: true } });
  for (const job of jobs) {
    const fixed = applyTextFixes(job.title);
    if (fixed !== job.title) {
      logChange("Job", job.id, "title", job.title, fixed);
      if (confirm) {
        await prisma.job.update({ where: { id: job.id }, data: { title: fixed } });
      }
    }
  }
}

async function main() {
  await fixRegions();
  await fixCompanyNames();
  await fixJobTitles();

  if (plannedChanges === 0) {
    console.log("✅ Aucune donnée à corriger : les accents sont en place.");
  } else if (confirm) {
    console.log(`\n✅ ${plannedChanges} champ(s) corrigé(s).`);
  } else {
    console.log(
      `\nDry-run : ${plannedChanges} champ(s) à corriger. Relancez avec CONFIRM=true pour appliquer.`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
