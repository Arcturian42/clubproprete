import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string = 'demo') {
  await page.goto('/connexion');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
}
