import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Authentification', () => {
  test('connexion compte démo société', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    // Un compte société (company_owner) est redirigé vers son tableau de bord
    // entreprise par rôle.
    await expect(page).toHaveURL(/\/dashboard\/entreprise/);
  });

  test('connexion compte démo admin', async ({ page }) => {
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: /validation et modération/i })).toBeVisible();
  });

  test('inscription nouvel utilisateur sans choix de profil', async ({ page }) => {
    const timestamp = Date.now();
    await page.goto('/inscription');

    // Le nouveau flow ne demande plus de profil : compte neutre puis onboarding.
    await page.getByRole('textbox', { name: 'Prénom *', exact: true }).fill('Jean');
    await page.getByRole('textbox', { name: 'Nom *', exact: true }).fill('Test');
    await page.getByRole('textbox', { name: 'Email *', exact: true }).fill(`jean.test+${timestamp}@clubproprete.test`);
    await page.getByPlaceholder('Votre mot de passe').first().fill('DemoPass123!');
    await page.getByRole('textbox', { name: /Téléphone/i }).fill('0600000000');

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /créer mon compte/i }).click();

    await page.waitForURL('/onboarding');
    await expect(page.getByRole('heading', { level: 1, name: /bienvenue/i })).toBeVisible();
  });

  test('onboarding société : crée la fiche et élève le rôle', async ({ page }) => {
    const timestamp = Date.now();
    const email = `jean.onboard+${timestamp}@clubproprete.test`;

    await page.goto('/inscription');
    await page.getByRole('textbox', { name: 'Prénom *', exact: true }).fill('Jean');
    await page.getByRole('textbox', { name: 'Nom *', exact: true }).fill('Onboard');
    await page.getByRole('textbox', { name: 'Email *', exact: true }).fill(email);
    await page.getByPlaceholder('Votre mot de passe').first().fill('DemoPass123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /créer mon compte/i }).click();
    await page.waitForURL('/onboarding');

    // Étape coordonnées
    await page.getByRole('button', { name: /continuer/i }).click();
    // Étape situation : sélection société
    await page.getByRole('button', { name: /je dirige une société de propreté/i }).click();
    await page.getByRole('button', { name: /continuer/i }).click();
    // Étape fiche société
    await page.getByRole('textbox', { name: /nom de la société/i }).fill(`Onboard Propreté ${timestamp}`);
    await page.getByRole('button', { name: /continuer/i }).click();
    // Récapitulatif
    await page.getByRole('button', { name: /valider et créer mon espace/i }).click();

    await expect(page.getByRole('heading', { name: /c'est prêt/i })).toBeVisible();
    await page.getByRole('link', { name: /ouvrir mon espace/i }).click();
    await page.waitForURL('/dashboard');
    await expect(page.getByRole('heading', { name: /optimiser ma fiche/i }).first()).toBeVisible();
  });
});
