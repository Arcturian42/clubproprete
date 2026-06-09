import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

async function fillJobForm(page: Page, title: string) {
  await page.getByPlaceholder('Ex: Agent de nettoyage H/F').fill(title);
  await page.getByPlaceholder('Décrivez les missions, le profil recherché...').fill('Description de test pour l\'offre.');
  await page.getByPlaceholder('Ex: Paris 15e').fill('Paris');
  await page.locator('select').selectOption('CDI');
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
  }

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
    await expect(page.getByText(/offre soumise/i)).toBeVisible();
    await page.waitForURL('/emploi', { timeout: 10_000 });

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
});
