import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Profil utilisateur', () => {
  test('affiche les informations après connexion', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');
    await page.goto('/profil');

    await expect(page).toHaveURL(/\/profil/);
    await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible();
    // Le bloc identité affiche le nom de l'utilisateur connecté
    await expect(page.getByRole('heading', { name: /Claire Martin/i })).toBeVisible();
    // Les réglages de visibilité du profil public sont présents
    await expect(page.getByRole('heading', { name: /Visibilité du profil/i })).toBeVisible();
  });
});
