import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

const SUPPLIER_OWNER_EMAIL = 'fournisseur-e2e@clubproprete.test';
const SUPPLIER_ID = 'supplier-e2e-1';

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash('demo', 10);

  const owner = await prisma.user.upsert({
    where: { email: SUPPLIER_OWNER_EMAIL },
    update: {
      passwordHash,
      firstName: 'Nicolas',
      lastName: 'Fournisseur',
      mainRole: 'supplier_owner',
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      email: SUPPLIER_OWNER_EMAIL,
      passwordHash,
      firstName: 'Nicolas',
      lastName: 'Fournisseur',
      mainRole: 'supplier_owner',
      emailVerified: true,
    },
  });

  await prisma.supplier.upsert({
    where: { id: SUPPLIER_ID },
    update: {
      ownerUserId: owner.id,
      name: 'MachinesNet E2E',
      category: 'autolaveuses',
      family: 'machines',
      subCategory: 'autolaveuses',
      offerType: 'les_deux',
      verificationStatus: 'approved',
      deletedAt: null,
    },
    create: {
      id: SUPPLIER_ID,
      ownerUserId: owner.id,
      name: 'MachinesNet E2E',
      legalName: 'MachinesNet E2E SAS',
      category: 'autolaveuses',
      family: 'machines',
      subCategory: 'autolaveuses',
      offerType: 'les_deux',
      verificationStatus: 'approved',
    },
  });

  await prisma.entityMember.upsert({
    where: {
      userId_entityType_entityId: {
        userId: owner.id,
        entityType: 'supplier',
        entityId: SUPPLIER_ID,
      },
    },
    update: { role: 'owner', status: 'active', deletedAt: null },
    create: {
      userId: owner.id,
      entityType: 'supplier',
      entityId: SUPPLIER_ID,
      role: 'owner',
    },
  });
});

test.afterAll(async () => {
  await prisma.supplier.update({
    where: { id: SUPPLIER_ID },
    data: { verificationStatus: 'approved' },
  }).catch(() => undefined);
  await prisma.$disconnect();
});

test.describe('Dashboard fournisseur', () => {
  test('le fournisseur peut modifier sa fiche depuis le dashboard', async ({ page }) => {
    await loginAs(page, SUPPLIER_OWNER_EMAIL);
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/fournisseur');
    await expect(page.getByRole('heading', { name: /ma fiche fournisseur/i })).toBeVisible();

    const updatedName = `MachinesNet E2E ${Date.now()}`;
    await page.getByRole('main').locator('input[name="name"]').first().fill(updatedName);
    await page.getByRole('button', { name: /enregistrer et soumettre/i }).click();

    await expect(page.getByText(/fiche fournisseur enregistrée/i)).toBeVisible();

    const supplier = await prisma.supplier.findUnique({ where: { id: SUPPLIER_ID } });
    expect(supplier?.name).toBe(updatedName);
    // La sauvegarde repasse la fiche en modération.
    expect(supplier?.verificationStatus).toBe('pending');

    await prisma.supplier.update({
      where: { id: SUPPLIER_ID },
      data: { verificationStatus: 'approved' },
    });
  });

  test('le fournisseur peut publier une offre au nom de son entité', async ({ page }) => {
    await prisma.supplier.update({
      where: { id: SUPPLIER_ID },
      data: { verificationStatus: 'approved' },
    });

    await loginAs(page, SUPPLIER_OWNER_EMAIL);
    await page.waitForURL('/dashboard');

    await page.goto('/emploi/nouvelle-offre');
    await expect(page.getByRole('heading', { name: /publier une offre/i })).toBeVisible();

    const title = `Offre fournisseur ${Date.now()}`;
    await page.getByPlaceholder('Ex: Agent de nettoyage H/F').fill(title);
    await page.getByPlaceholder('Décrivez les missions, le profil recherché...').fill('Technicien de maintenance machines.');
    await page.getByPlaceholder('Ex: Paris 15e').fill('Lille');
    await page.getByLabel('Type de contrat').selectOption('CDI');

    await page.getByRole('button', { name: /publier l'offre/i }).click();

    await expect(page.getByRole('heading', { name: /offre soumise/i })).toBeVisible();

    const job = await prisma.job.findFirst({
      where: { title, employerType: 'supplier', employerEntityId: SUPPLIER_ID },
    });
    expect(job).not.toBeNull();
    expect(job?.companyId).toBeNull();
  });
});
