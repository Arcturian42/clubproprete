import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Sous-traitance', () => {
  test('affiche accès refusé si non authentifié', async ({ page }) => {
    await page.goto('/sous-traitance');
    await expect(page.getByRole('heading', { name: /sous-traitance/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /accès refusé/i }).first()).toBeVisible();
  });

  test('membre association peut accéder à la page', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');
    await page.goto('/sous-traitance');
    await expect(page.getByRole('heading', { name: /sous-traitance/i })).toBeVisible();
    await expect(page.getByText(/accès refusé/i)).not.toBeVisible();
  });
});
