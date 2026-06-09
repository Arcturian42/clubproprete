import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Offres d\'emploi', () => {
  test('créer une offre', async ({ page }) => {
    await loginAs(page, 'societe@clubproprete.test');
    await page.waitForURL('/dashboard');

    await page.goto('/emploi/nouvelle-offre');
    await expect(page.getByRole('heading', { name: /publier une offre/i })).toBeVisible();

    const title = `Test offre ${Date.now()}`;
    await page.getByPlaceholder('Ex: Agent de nettoyage H/F').fill(title);
    await page.getByPlaceholder('Décrivez les missions, le profil recherché...').fill('Description de test pour l\'offre.');
    await page.getByPlaceholder('Ex: Paris 15e').fill('Paris');
    await page.locator('select').selectOption('CDI');
    await page.getByPlaceholder('Ex: 1800€ brut/mois selon expérience').fill('2000€ brut/mois');
    await page.getByPlaceholder('Expérience, permis, habilitations...').fill('Aucun prérequis particulier.');

    await page.getByRole('button', { name: /publier l'offre/i }).click();

    // La page affiche d'abord le succès puis redirige après 2s
    await expect(page.getByText(/offre soumise/i)).toBeVisible();
    await page.waitForURL('/emploi', { timeout: 10_000 });

    // L'offre est créée en statut "pending", elle n'apparaît pas encore publiquement
    await expect(page.getByRole('heading', { name: /offres d'emploi/i })).toBeVisible();
  });
});
