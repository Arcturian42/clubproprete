import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

const EMAIL = 'qa-reset@clubproprete.test';

function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash('demo', 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { passwordHash, emailVerified: true, deletedAt: null, mainRole: 'company_owner' },
    create: { email: EMAIL, passwordHash, firstName: 'Re', lastName: 'Set', mainRole: 'company_owner', emailVerified: true },
  });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Réinitialisation de mot de passe', () => {
  test('la demande crée un jeton de réinitialisation', async ({ page }) => {
    await page.goto('/mot-de-passe-oublie');
    await page.getByLabel('Adresse email').fill(EMAIL);
    await page.getByRole('button', { name: /envoyer le lien/i }).click();

    await expect(page.getByText(/vérifiez votre boîte mail/i)).toBeVisible();

    const user = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } });
    const tokenCount = await prisma.passwordResetToken.count({ where: { userId: user.id, usedAt: null } });
    expect(tokenCount).toBeGreaterThanOrEqual(1);
  });

  test('un jeton valide permet de changer le mot de passe puis de se connecter', async ({ page }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await page.goto(`/reinitialiser-mot-de-passe?token=${rawToken}`);
    // Mot de passe conforme à la politique forte (≥10 car., majuscule, minuscule, chiffre, symbole).
    await page.getByLabel('Nouveau mot de passe').fill('NouveauMotDePasse123!');
    await page.getByRole('button', { name: /réinitialiser le mot de passe/i }).click();

    await expect(page.getByText(/mot de passe mis à jour/i)).toBeVisible();

    // Le jeton est consommé.
    const used = await prisma.passwordResetToken.findFirst({ where: { userId: user.id } });
    expect(used?.usedAt).not.toBeNull();

    // Connexion avec le nouveau mot de passe.
    await loginAs(page, EMAIL, 'NouveauMotDePasse123!');
    // La connexion réussie avec le nouveau mot de passe atterrit dans l'espace
    // connecté (redirigé par rôle).
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('un jeton invalide est refusé', async ({ page }) => {
    await page.goto('/reinitialiser-mot-de-passe?token=jetontotalementbidonquinexistepas');
    // Mot de passe conforme : la validation passe, le refus vient bien du jeton invalide.
    await page.getByLabel('Nouveau mot de passe').fill('PeuImporte123!');
    await page.getByRole('button', { name: /réinitialiser le mot de passe/i }).click();

    await expect(page.getByText(/invalide ou expiré/i)).toBeVisible();
  });
});
