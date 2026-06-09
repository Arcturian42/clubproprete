import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Profil utilisateur', () => {
  test('affiche les informations après connexion', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');
    await page.goto('/profil');

    await expect(page).toHaveURL(/\/profil/);
    // Le titre contient le prénom de l'utilisateur connecté
    await expect(page.getByRole('heading', { name: /Bonjour, Claire/i })).toBeVisible();
    // Vérifie la présence du bloc "Profil entreprise"
    await expect(page.getByRole('heading', { name: /Profil entreprise/i })).toBeVisible();
  });
});
