import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Admin', () => {
  test('charge la file de moderation avec les boutons Valider et Refuser', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('table')).toBeVisible();
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.getByRole('button', { name: 'Valider' })).toBeVisible();
    await expect(firstRow.getByRole('button', { name: 'Refuser' })).toBeVisible();
  });

  test('admin voit le badge Admin', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByText('Admin').first()).toBeVisible();
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

  test('admin standard ne peut pas acceder a la gestion utilisateurs', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByRole('link', { name: /gestion utilisateurs/i })).not.toBeVisible();

    await page.goto('/admin/users');
    await expect(page).toHaveURL('/admin');
  });
});
