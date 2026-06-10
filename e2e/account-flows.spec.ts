import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

const REGISTERED_EMAIL = 'qa-registered@clubproprete.test';
const ASSOC_EMAIL = 'qa-assoc@clubproprete.test';
const ASSOC_COMPANY_ID = 'company-qa-assoc';

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash('demo', 10);

  // Utilisateur générique (registered_user) SANS entité — sert à valider l'élévation de rôle.
  const registered = await prisma.user.upsert({
    where: { email: REGISTERED_EMAIL },
    update: { passwordHash, mainRole: 'registered_user', emailVerified: true, deletedAt: null },
    create: {
      email: REGISTERED_EMAIL,
      passwordHash,
      firstName: 'Gene',
      lastName: 'Rique',
      mainRole: 'registered_user',
      emailVerified: true,
    },
  });
  // Reset idempotent : supprime toute société/adhésion créée par un run précédent.
  await prisma.entityMember.deleteMany({ where: { userId: registered.id } });
  await prisma.company.deleteMany({ where: { ownerUserId: registered.id } });
  await prisma.user.update({ where: { id: registered.id }, data: { mainRole: 'registered_user' } });

  // Propriétaire de société avec adhésion association en attente — valide le reflet sans reconnexion.
  const assocOwner = await prisma.user.upsert({
    where: { email: ASSOC_EMAIL },
    update: { passwordHash, mainRole: 'company_owner', emailVerified: true, deletedAt: null },
    create: {
      email: ASSOC_EMAIL,
      passwordHash,
      firstName: 'Asso',
      lastName: 'Owner',
      mainRole: 'company_owner',
      emailVerified: true,
    },
  });

  await prisma.company.upsert({
    where: { id: ASSOC_COMPANY_ID },
    update: { ownerUserId: assocOwner.id, name: 'QA Assoc Co', verificationStatus: 'approved', associationMember: false, deletedAt: null },
    create: {
      id: ASSOC_COMPANY_ID,
      ownerUserId: assocOwner.id,
      name: 'QA Assoc Co',
      verificationStatus: 'approved',
    },
  });
  await prisma.entityMember.upsert({
    where: { userId_entityType_entityId: { userId: assocOwner.id, entityType: 'company', entityId: ASSOC_COMPANY_ID } },
    update: { role: 'owner', status: 'active', deletedAt: null },
    create: { userId: assocOwner.id, entityType: 'company', entityId: ASSOC_COMPANY_ID, role: 'owner' },
  });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Vérification de compte & rôles (régressions audit)', () => {
  test('PB-1 — un compte fraîchement inscrit est vérifié et peut publier après validation société', async ({ page }) => {
    const ts = Date.now();
    const email = `qa-publish-${ts}@clubproprete.test`;

    await page.goto('/inscription');
    await page.getByRole('textbox', { name: 'Prénom *', exact: true }).fill('Pub');
    await page.getByRole('textbox', { name: 'Nom *', exact: true }).fill('Lisher');
    await page.getByRole('textbox', { name: 'Email *', exact: true }).fill(email);
    await page.getByLabel('Mot de passe').fill('demo123');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /créer mon compte/i }).click();
    await page.waitForURL('/onboarding');

    // Nouveau flow : la fiche société se crée via l'onboarding, plus à l'inscription.
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.getByRole('button', { name: /je dirige une société de propreté/i }).click();
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.getByRole('textbox', { name: /nom de la société/i }).fill('QA Publish Co');
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.getByRole('button', { name: /valider et créer mon espace/i }).click();
    await expect(page.getByRole('heading', { name: /c'est prêt/i })).toBeVisible();

    // PB-1 : le compte personnel est auto-vérifié à l'inscription (AUCUN patch DB).
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.emailVerified).toBe(true);

    // Simule la validation admin de la société.
    await prisma.company.updateMany({ where: { ownerUserId: user!.id }, data: { verificationStatus: 'approved' } });

    // L'utilisateur (déjà connecté) publie une offre — ce qui était impossible avant le fix.
    await page.goto('/emploi/nouvelle-offre');
    await expect(page.getByRole('heading', { name: /publier une offre/i })).toBeVisible();
    await page.getByPlaceholder('Ex: Agent de nettoyage H/F').fill(`Offre QA ${ts}`);
    await page.getByPlaceholder('Décrivez les missions, le profil recherché...').fill('Description de test.');
    await page.getByPlaceholder('Ex: Paris 15e').fill('Paris');
    await page.getByLabel('Type de contrat').selectOption('CDI');
    await page.getByRole('button', { name: /publier l'offre/i }).click();

    await expect(page.getByText(/offre soumise/i)).toBeVisible();

    const job = await prisma.job.findFirst({ where: { createdBy: user!.id, employerType: 'company' } });
    expect(job).not.toBeNull();
    expect(job?.status).toBe('pending');
  });

  test('PB-3 — créer une société depuis le dashboard élève le rôle et ouvre la vue entreprise', async ({ page }) => {
    await loginAs(page, REGISTERED_EMAIL);
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/entreprise');
    await page.getByRole('button', { name: /^modifier$/i }).first().click();
    await page.getByRole('button', { name: /sauvegarder/i }).click();

    // Le rôle est élevé en base.
    await expect
      .poll(async () => {
        const u = await prisma.user.findUnique({ where: { email: REGISTERED_EMAIL } });
        return u?.mainRole;
      }, { timeout: 10_000 })
      .toBe('company_owner');

    // Le dashboard reflète immédiatement la nouvelle capacité (vue entreprise), sans reconnexion.
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /optimiser ma fiche/i }).first()).toBeVisible();
  });

  test('PB-2 — l’approbation d’adhésion se reflète sur le dashboard sans reconnexion', async ({ page }) => {
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: ASSOC_EMAIL } });

    // État initial : adhésion en attente, société non marquée membre.
    await prisma.associationMembership.deleteMany({ where: { userId: owner.id } });
    await prisma.associationMembership.create({
      data: { userId: owner.id, profileType: 'company_owner', entityType: 'association', status: 'pending' },
    });
    await prisma.company.update({ where: { id: ASSOC_COMPANY_ID }, data: { associationMember: false } });

    await loginAs(page, ASSOC_EMAIL);
    await page.waitForURL('/dashboard');
    await expect(page.getByText('Membre association')).toHaveCount(0);

    // L'admin approuve l'adhésion APRÈS la connexion.
    await prisma.associationMembership.updateMany({ where: { userId: owner.id }, data: { status: 'approved' } });

    // Rechargement simple du dashboard : le statut est relu depuis la base (pas de reconnexion).
    await page.goto('/dashboard');
    await expect(page.getByText('Membre association').first()).toBeVisible();
  });
});
