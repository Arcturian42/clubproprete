import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

test.beforeAll(async () => {
  const verifiedUser = await prisma.user.findUnique({ where: { email: 'societe@clubproprete.test' } });
  if (verifiedUser) {
    await prisma.job.upsert({
      where: { id: 'job-pending-admin-e2e' },
      update: {
        companyId: 'company-1',
        createdBy: verifiedUser.id,
        title: 'Offre pending admin E2E',
        description: 'Description test modération.',
        contractType: 'CDI',
        city: 'Nice',
        status: 'pending',
        deletedAt: null,
      },
      create: {
        id: 'job-pending-admin-e2e',
        companyId: 'company-1',
        createdBy: verifiedUser.id,
        title: 'Offre pending admin E2E',
        description: 'Description test modération.',
        contractType: 'CDI',
        city: 'Nice',
        status: 'pending',
      },
    });
  }
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Admin', () => {
  test('charge la file de modération avec les boutons Valider et Refuser', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await page.waitForLoadState('networkidle');

    // Il y a 2 tableaux : pending jobs (premier) et file générale (deuxième)
    const generalTable = page.locator('table').nth(1);
    await expect(generalTable).toBeVisible();
    const firstRow = generalTable.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.getByRole('button', { name: 'Valider' })).toBeVisible();
    await expect(firstRow.getByRole('button', { name: 'Refuser' })).toBeVisible();
  });

  test('admin voit le badge Admin', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByText('Admin').first()).toBeVisible();
  });

  test('admin peut publier une offre en attente', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await page.waitForLoadState('networkidle');

    // Vérifier que l'offre pending est visible dans la section dédiée (premier tableau)
    await expect(page.getByRole('heading', { name: /offres en attente de modération/i })).toBeVisible();
    const pendingTable = page.locator('table').first();
    await expect(pendingTable.getByText('Offre pending admin E2E').first()).toBeVisible();

    // Publier l'offre depuis le tableau pending
    const pendingRow = pendingTable.locator('tbody tr').filter({ hasText: 'Offre pending admin E2E' });
    await Promise.all([
      page.waitForResponse((resp) => resp.request().method() === 'POST'),
      pendingRow.getByRole('button', { name: 'Publier' }).click(),
    ]);
    await page.waitForLoadState('networkidle');

    // Vérifier en base que le statut est bien "published"
    const job = await prisma.job.findUnique({ where: { id: 'job-pending-admin-e2e' } });
    expect(job?.status).toBe('published');

    // Revenir sur /admin et vérifier que l'offre n'apparaît plus dans le tableau pending
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(pendingTable.getByText('Offre pending admin E2E')).not.toBeVisible();
  });
});

test.describe('Super Admin', () => {
  test('super admin voit le badge Super Admin', async ({ page }) => {
    await loginAs(page, 'superadmin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByText('Super Admin').first()).toBeVisible();
  });

  test('super admin peut acceder a la gestion utilisateurs', async ({ page }) => {
    await loginAs(page, 'superadmin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByRole('link', { name: /gestion utilisateurs/i })).toBeVisible();

    await page.getByRole('link', { name: /gestion utilisateurs/i }).click();
    await page.waitForURL('/admin/users');
    await expect(page.getByRole('heading', { name: /gestion des utilisateurs/i })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('le dashboard membre redirige le super admin vers le cockpit', async ({ page }) => {
    await loginAs(page, 'superadmin@clubproprete.test');
    await page.goto('/dashboard');
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: /centre de contrôle/i })).toBeVisible();
    await expect(page.getByText(/contrôle des comptes/i).first()).toBeVisible();
  });

  test('le registre utilisateurs expose les filtres et les fiches de contrôle', async ({ page }) => {
    await loginAs(page, 'superadmin@clubproprete.test');
    await page.goto('/admin/users');
    await expect(page.getByPlaceholder('Nom, email ou téléphone')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filtrer par statut' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Examiner' }).first()).toBeVisible();
  });

  test('admin standard ne peut pas acceder a la gestion utilisateurs', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByRole('link', { name: /gestion utilisateurs/i })).not.toBeVisible();

    await page.goto('/admin/users');
    await expect(page).toHaveURL('/admin');
  });
});
