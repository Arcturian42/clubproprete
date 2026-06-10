import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

async function fillJobForm(page: Page, title: string) {
  await page.getByPlaceholder('Ex: Agent de nettoyage H/F').fill(title);
  await page.getByPlaceholder('Décrivez les missions, le profil recherché...').fill('Description de test pour l\'offre.');
  await page.getByPlaceholder('Ex: Paris 15e').fill('Paris');
  await page.getByLabel('Type de contrat').selectOption('CDI');
  await page.getByPlaceholder('Ex: 1800€ brut/mois selon expérience').fill('2000€ brut/mois');
  await page.getByPlaceholder('Expérience, permis, habilitations...').fill('Aucun prérequis particulier.');
}

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash('demo', 10);
  const verifiedUser = await prisma.user.findUnique({ where: { email: 'societe@clubproprete.test' } });

  if (verifiedUser) {
    await prisma.user.update({
      where: { id: verifiedUser.id },
      data: { emailVerified: true },
    });
    await prisma.company.updateMany({
      where: { ownerUserId: verifiedUser.id },
      data: { verificationStatus: 'approved', deletedAt: null },
    });

    await prisma.company.upsert({
      where: { id: 'company-1' },
      update: {
        ownerUserId: verifiedUser.id,
        name: 'Azur Proprete Services',
        city: 'Nice',
        verificationStatus: 'approved',
        deletedAt: null,
      },
      create: {
        id: 'company-1',
        ownerUserId: verifiedUser.id,
        name: 'Azur Proprete Services',
        city: 'Nice',
        verificationStatus: 'approved',
      },
    });

    await prisma.job.upsert({
      where: { id: 'job-1' },
      update: {
        companyId: 'company-1',
        createdBy: verifiedUser.id,
        title: 'Chef d\'equipe propreté tertiaire',
        description: 'Nous recherchons un chef d\'équipe expérimenté pour un site tertiaire.',
        contractType: 'CDI',
        city: 'Nice',
        status: 'published',
        deletedAt: null,
      },
      create: {
        id: 'job-1',
        companyId: 'company-1',
        createdBy: verifiedUser.id,
        title: 'Chef d\'equipe propreté tertiaire',
        description: 'Nous recherchons un chef d\'équipe expérimenté pour un site tertiaire.',
        contractType: 'CDI',
        city: 'Nice',
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidat@clubproprete.test' },
    update: {
      passwordHash,
      firstName: 'Laura',
      lastName: 'D.',
      mainRole: 'candidate_profile',
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      email: 'candidat@clubproprete.test',
      passwordHash,
      firstName: 'Laura',
      lastName: 'D.',
      mainRole: 'candidate_profile',
      emailVerified: true,
    },
  });

  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {
      firstName: 'Laura',
      lastName: 'D.',
      city: 'Paris',
      deletedAt: null,
    },
    create: {
      userId: candidateUser.id,
      firstName: 'Laura',
      lastName: 'D.',
      city: 'Paris',
      desiredContracts: 'CDI,CDD',
      experienceYears: 3,
    },
  });

  await prisma.jobApplication.deleteMany({
    where: { jobId: 'job-1', candidateProfileId: candidateProfile.id },
  });

  await prisma.jobApplication.create({
    data: {
      id: 'application-e2e-1',
      jobId: 'job-1',
      candidateProfileId: candidateProfile.id,
      applicantUserId: candidateUser.id,
      message: 'Je suis très intéressée par ce poste.',
      status: 'submitted',
    },
  });

  const unverifiedUser = await prisma.user.upsert({
    where: { email: 'societe-non-verifiee@clubproprete.test' },
    update: {
      passwordHash,
      firstName: 'Noémie',
      lastName: 'En attente',
      mainRole: 'company_owner',
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      email: 'societe-non-verifiee@clubproprete.test',
      passwordHash,
      firstName: 'Noémie',
      lastName: 'En attente',
      mainRole: 'company_owner',
      emailVerified: true,
    },
  });

  await prisma.company.upsert({
    where: { id: 'company-unverified-e2e' },
    update: {
      ownerUserId: unverifiedUser.id,
      name: 'Société en attente E2E',
      city: 'Paris',
      verificationStatus: 'pending',
      deletedAt: null,
    },
    create: {
      id: 'company-unverified-e2e',
      ownerUserId: unverifiedUser.id,
      name: 'Société en attente E2E',
      city: 'Paris',
      verificationStatus: 'pending',
    },
  });

  // Job pour la société non vérifiée (utilisé pour tester le gating candidatures)
  await prisma.job.upsert({
    where: { id: 'job-unverified-e2e' },
    update: {
      companyId: 'company-unverified-e2e',
      createdBy: unverifiedUser.id,
      title: 'Offre société non vérifiée',
      description: 'Description test.',
      contractType: 'CDI',
      city: 'Paris',
      status: 'pending',
      deletedAt: null,
    },
    create: {
      id: 'job-unverified-e2e',
      companyId: 'company-unverified-e2e',
      createdBy: unverifiedUser.id,
      title: 'Offre société non vérifiée',
      description: 'Description test.',
      contractType: 'CDI',
      city: 'Paris',
      status: 'pending',
    },
  });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Offres d\'emploi', () => {
  test('créer une offre', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/emploi/nouvelle-offre');
    await expect(page.getByRole('heading', { name: /publier une offre/i })).toBeVisible();

    const title = `Test offre ${Date.now()}`;
    await fillJobForm(page, title);

    await page.getByRole('button', { name: /publier l'offre/i }).click();

    // La page affiche d'abord le succès puis redirige après 2s
    await expect(page.getByRole('heading', { name: /offre soumise/i })).toBeVisible();
    await page.goto('/emploi');

    // L'offre est créée en statut "pending", elle n'apparaît pas encore publiquement
    await expect(page.getByRole('heading', { name: /offres d'emploi/i })).toBeVisible();
  });

  test('refuse une société non vérifiée', async ({ page }) => {
    await loginAs(page, 'societe-non-verifiee@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/emploi/nouvelle-offre');
    await expect(page.getByRole('heading', { name: /publier une offre/i })).toBeVisible();

    await fillJobForm(page, `Offre refusée ${Date.now()}`);
    await page.getByRole('button', { name: /publier l'offre/i }).click();

    await expect(page.getByText(/compte personnel et votre société doivent être validés/i)).toBeVisible();
    await expect(page.getByText(/offre soumise/i)).not.toBeVisible();
  });

  test('candidat postule avec son propre profil', async ({ page }) => {
    const candidateUser = await prisma.user.findUnique({
      where: { email: 'candidat@clubproprete.test' },
      include: { candidateProfile: true },
    });

    if (!candidateUser?.candidateProfile) {
      throw new Error('Profil candidat de test introuvable.');
    }

    // Nettoyer toute candidature existante pour permettre le test de postulation
    await prisma.jobApplication.deleteMany({
      where: { jobId: 'job-1', candidateProfileId: candidateUser.candidateProfile.id },
    });

    await loginAs(page, 'candidat@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/emploi/job-1');
    await page.locator('textarea[name="message"]').fill('Disponible rapidement pour un entretien.');
    await page.getByRole('button', { name: /postuler/i }).click();
    await page.waitForURL('/dashboard');

    const application = await prisma.jobApplication.findFirst({
      where: {
        jobId: 'job-1',
        candidateProfileId: candidateUser.candidateProfile.id,
        deletedAt: null,
      },
    });

    expect(application?.applicantUserId).toBe(candidateUser.id);
  });

  test('owner voit les candidatures de son offre et peut mettre à jour le statut', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/entreprise/offres/job-1/candidatures');
    await expect(page.getByRole('heading', { name: /candidatures/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /laura d\./i }).first()).toBeVisible();
    await expect(page.locator('span.bento-tag', { hasText: /Reçu/i }).first()).toBeVisible();

    // Modifier le statut
    await page.locator('select[name="status"]').first().selectOption('interview');
    await page.locator('textarea[name="internalNotes"]').first().fill('Entretien prévu jeudi 10h');
    await page.getByRole('button', { name: /enregistrer/i }).click();

    await page.reload();
    await expect(page.locator('select[name="status"]').first()).toHaveValue('interview');
    await expect(page.locator('textarea[name="internalNotes"]').first()).toHaveValue('Entretien prévu jeudi 10h');
  });

  test('candidat ne peut pas voir les candidatures d\'une offre', async ({ page }) => {
    await loginAs(page, 'candidat@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/entreprise/offres/job-1/candidatures');
    await expect(page.locator('section p.text-slate-600').first()).toContainText(/Entité introuvable|accès refusé/i);
  });

  test('société non vérifiée ne peut pas voir les candidatures d\'une autre société', async ({ page }) => {
    await loginAs(page, 'societe-non-verifiee@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/entreprise/offres/job-1/candidatures');
    await expect(page.locator('section p.text-slate-600').first()).toContainText(/Entité introuvable|accès refusé/i);
  });

  test('société non vérifiée ne peut pas voir les candidatures de ses propres offres', async ({ page }) => {
    await loginAs(page, 'societe-non-verifiee@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/entreprise/offres/job-unverified-e2e/candidatures');
    await expect(page.locator('section p.text-slate-600').first()).toContainText(/doit être vérifiée/i);
  });
});
