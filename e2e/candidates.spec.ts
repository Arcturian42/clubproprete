import { test, expect } from '@playwright/test';

test.describe('Candidats', () => {
  test('un visiteur anonyme ne voit aucun nom de candidat', async ({ page }) => {
    await page.goto('/candidats');
    await page.waitForURL('/connexion*');

    await expect(page.getByRole('heading', { name: /connexion/i }).first()).toBeVisible();
    await expect(page.getByText('Laura D.')).not.toBeVisible();
    await expect(page.getByText(/profils candidats emploi/i)).not.toBeVisible();
  });
});
