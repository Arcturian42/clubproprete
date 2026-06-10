import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigation publique', async ({ page }) => {
    const publicRoutes = [
      { path: '/', heading: /club propreté/i },
      { path: '/emploi', heading: /offres d'emploi/i },
      { path: '/formations', heading: /espace formation/i },
      { path: '/ressources', heading: /ressources/i },
      { path: '/annuaire/societes', heading: /societes/i },
    ];

    for (const route of publicRoutes) {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      // .first() : certaines pages répètent le nom (héros + pied de page), on vérifie
      // simplement qu'au moins un titre attendu est rendu.
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    }
  });

  test('navigation protégée', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('/connexion*');
    await expect(page.getByRole('heading', { name: /connexion/i }).first()).toBeVisible();
  });

  test('menu mobile burger', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });

    const burger = page.getByRole('button', { name: 'Ouvrir le menu' });
    await expect(burger).toBeVisible();
    await burger.click();

    // En mobile, seul le lien du menu mobile est visible dans le header
    await expect(page.locator('header a:visible:has-text("Emploi")').first()).toBeVisible();
    await expect(page.locator('header a:visible:has-text("Formations")').first()).toBeVisible();
  });
});
