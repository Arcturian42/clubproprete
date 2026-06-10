import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

const AUTHOR_EMAIL = 'qa-author@clubproprete.test';

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash('demo', 10);

  const user = await prisma.user.upsert({
    where: { email: AUTHOR_EMAIL },
    update: { passwordHash, mainRole: 'registered_user', emailVerified: true, deletedAt: null },
    create: {
      email: AUTHOR_EMAIL,
      passwordHash,
      firstName: 'Au',
      lastName: 'Teur',
      mainRole: 'registered_user',
      emailVerified: true,
    },
  });

  // Reset idempotent : repart d'un compte sans demande ni article ni rôle auteur.
  await prisma.authorApplication.deleteMany({ where: { userId: user.id } });
  await prisma.article.deleteMany({ where: { authorId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { mainRole: 'registered_user' } });

  // S'assurer que l'admin de démo est connectable et vérifié.
  await prisma.user.updateMany({
    where: { email: 'admin@clubproprete.test' },
    data: { passwordHash, emailVerified: true, deletedAt: null },
  });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Flux auteur (demande → validation → panel)', () => {
  test('un compte demande l’accès auteur, l’admin valide, l’article est publié et le panel s’ouvre', async ({ page }) => {
    const articleTitle = `Tribune QA ${Date.now()}`;

    // 1. Demande d'accès auteur avec premier article.
    await loginAs(page, AUTHOR_EMAIL);
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/auteur');

    await page.locator('input[name="title"]').fill(articleTitle);
    await page.locator('input[name="category"]').fill('Tribune');
    await page.locator('textarea[name="excerpt"]').fill('Résumé de tribune pour valider le flux auteur QA.');
    await page
      .locator('textarea[name="content"]')
      .fill('Contenu complet de l’article de test, suffisamment long pour dépasser la validation minimale de quatre-vingts caractères imposée par le schéma.');
    await page.locator('textarea[name="motivation"]').fill('Je souhaite partager mon expertise terrain en propreté.');
    await page.getByRole('button', { name: /demander l'accès auteur/i }).click();

    await expect(page.getByText(/demande envoyée/i)).toBeVisible();

    const user = await prisma.user.findUniqueOrThrow({ where: { email: AUTHOR_EMAIL } });
    const application = await prisma.authorApplication.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { article: true },
    });
    expect(application?.status).toBe('pending');
    expect(application?.article?.status).toBe('pending');
    expect(application?.article?.title).toBe(articleTitle);

    // 2. L'admin valide la demande depuis la file de modération.
    await loginAs(page, 'admin@clubproprete.test');
    await page.waitForURL('/admin');
    // L'article apparaît aussi comme entrée "Article" : on cible la ligne "Demande auteur".
    const row = page.locator('tr').filter({ hasText: articleTitle }).filter({ hasText: 'Demande auteur' });
    await row.getByRole('button', { name: 'Valider' }).click();

    // 3. Effets : article publié, demande approuvée, compte élevé en auteur.
    await expect
      .poll(async () => {
        const article = await prisma.article.findUnique({ where: { id: application!.articleId! } });
        return article?.status;
      }, { timeout: 10_000 })
      .toBe('published');

    const approvedApplication = await prisma.authorApplication.findUnique({ where: { id: application!.id } });
    expect(approvedApplication?.status).toBe('approved');

    const elevated = await prisma.user.findUniqueOrThrow({ where: { email: AUTHOR_EMAIL } });
    expect(elevated.mainRole).toBe('author');

    // 4. Le panel auteur est désormais accessible (rédaction).
    await loginAs(page, AUTHOR_EMAIL);
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/auteur');
    await expect(page.getByRole('heading', { name: /nouvel article/i })).toBeVisible();
  });
});
