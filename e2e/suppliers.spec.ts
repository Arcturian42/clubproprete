import { test, expect } from '@playwright/test';

test.describe('Annuaire fournisseurs', () => {
  test('affiche la liste et permet de consulter un fournisseur', async ({ page }) => {
    await page.goto('/annuaire/fournisseurs');
    await expect(page.getByRole('heading', { name: 'Fournisseurs', exact: true })).toBeVisible();

    // Vérifie la présence de fournisseurs seedés
    await expect(page.getByText('EcoMateriel Pro').first()).toBeVisible();
    await expect(page.getByText('EPI Direct').first()).toBeVisible();

    // Clique sur le premier lien de fournisseur
    const supplierLink = page.getByRole('link', { name: /EcoMateriel Pro/i }).first();
    await expect(supplierLink).toBeVisible();
    await supplierLink.click();

    // Vérifie la navigation vers la fiche détail
    await page.waitForURL(/\/annuaire\/fournisseurs\/.+/);
    await expect(page.getByRole('heading', { name: /EcoMateriel Pro/i })).toBeVisible();
  });

  test('filtre les fournisseurs par catégorie', async ({ page }) => {
    await page.goto('/annuaire/fournisseurs?family=machines');

    await expect(page.getByRole('heading', { name: 'Fournisseurs', exact: true })).toBeVisible();
    const supplierCard = page.getByRole('link', { name: /Voir la fiche de MachinesNet Industries/i });
    await expect(supplierCard).toBeVisible();
    await expect(supplierCard).toContainText('Achat & location');
    await expect(page.getByText('EcoMateriel Pro').first()).not.toBeVisible();
  });
});
