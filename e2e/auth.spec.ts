import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Authentification', () => {
  test('connexion compte démo société', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('connexion compte démo admin', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: /validation et moderation/i })).toBeVisible();
  });

  test('inscription nouvel utilisateur', async ({ page }) => {
    const timestamp = Date.now();
    await page.goto('/inscription');

    // Sélectionner un profil (par défaut Société)
    await page.getByRole('button', { name: 'Societe de nettoyage' }).click();

    await page.getByRole('textbox', { name: 'Prénom *', exact: true }).fill('Jean');
    await page.getByRole('textbox', { name: 'Nom *', exact: true }).fill('Test');
    await page.getByRole('textbox', { name: 'Email *', exact: true }).fill(`jean.test+${timestamp}@clubproprete.test`);
    await page.getByLabel('Mot de passe').fill('demo123');
    await page.getByRole('textbox', { name: 'Téléphone', exact: true }).fill('0600000000');
    await page.getByRole('textbox', { name: /Société \/ structure/i }).fill('Test Propreté');

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /continuer l'onboarding/i }).click();

    await page.waitForURL('/onboarding');
    await expect(page.getByRole('heading', { name: /qualification/i })).toBeVisible();
  });
});
