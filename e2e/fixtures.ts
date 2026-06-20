import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string = 'demo') {
  // Une session active redirige /connexion vers /dashboard : on repart toujours
  // d'une session vierge pour que le formulaire de connexion soit présent.
  await page.context().clearCookies();
  await page.goto('/connexion');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Adresse email').fill(email);
  // Le champ mot de passe expose aria-label="Mot de passe" (exact). Le bouton
  // afficher/masquer contient « mot de passe » dans son libellé : on cible donc
  // le libellé exact pour éviter l'ambiguïté (strict mode).
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
}
