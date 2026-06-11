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
    // La gestion des recommandations reçues est présente
    await expect(page.getByRole('heading', { name: /Recommandations reçues/i })).toBeVisible();
  });

  test('annuaire des membres public', async ({ page }) => {
    const response = await page.goto('/membres');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Annuaire des membres/i })).toBeVisible();
  });

  test('profil public façon LinkedIn', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');
    await page.goto('/profil');
    // Le lien "Voir mon profil public" mène à la page membre
    await page.getByRole('link', { name: /Voir mon profil public/i }).click();
    await page.waitForURL(/\/membres\//);
    await expect(page.getByRole('heading', { name: /Claire Martin/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Recommandations/i }).first()).toBeVisible();
  });
});
