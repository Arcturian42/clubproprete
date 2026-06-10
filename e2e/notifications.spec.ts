import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './fixtures';

const prisma = new PrismaClient();

const OWNER_EMAIL = 'qa-notif-owner@clubproprete.test';
const CAND_EMAIL = 'qa-notif-cand@clubproprete.test';
const COMPANY_ID = 'company-notif';
const JOB_ID = 'job-notif';

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash('demo', 10);

  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { passwordHash, mainRole: 'company_owner', emailVerified: true, deletedAt: null },
    create: { email: OWNER_EMAIL, passwordHash, firstName: 'Noti', lastName: 'Owner', mainRole: 'company_owner', emailVerified: true },
  });

  await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: { ownerUserId: owner.id, name: 'Notif Co', verificationStatus: 'approved', deletedAt: null },
    create: { id: COMPANY_ID, ownerUserId: owner.id, name: 'Notif Co', city: 'Paris', verificationStatus: 'approved' },
  });
  await prisma.entityMember.upsert({
    where: { userId_entityType_entityId: { userId: owner.id, entityType: 'company', entityId: COMPANY_ID } },
    update: { role: 'owner', status: 'active', deletedAt: null },
    create: { userId: owner.id, entityType: 'company', entityId: COMPANY_ID, role: 'owner' },
  });

  await prisma.job.upsert({
    where: { id: JOB_ID },
    update: { companyId: COMPANY_ID, employerType: 'company', employerEntityId: COMPANY_ID, createdBy: owner.id, title: 'Agent notif', status: 'published', deletedAt: null },
    create: {
      id: JOB_ID,
      companyId: COMPANY_ID,
      employerType: 'company',
      employerEntityId: COMPANY_ID,
      createdBy: owner.id,
      title: 'Agent notif',
      description: 'Offre pour valider les notifications.',
      contractType: 'CDI',
      city: 'Paris',
      status: 'published',
      publishedAt: new Date(),
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: CAND_EMAIL },
    update: { passwordHash, mainRole: 'candidate_profile', emailVerified: true, deletedAt: null },
    create: { email: CAND_EMAIL, passwordHash, firstName: 'Noti', lastName: 'Cand', mainRole: 'candidate_profile', emailVerified: true },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: candidate.id },
    update: { firstName: 'Noti', lastName: 'Cand', city: 'Paris', deletedAt: null },
    create: { userId: candidate.id, firstName: 'Noti', lastName: 'Cand', city: 'Paris', desiredContracts: 'CDI', experienceYears: 2 },
  });

  // Reset idempotent.
  const cp = await prisma.candidateProfile.findUniqueOrThrow({ where: { userId: candidate.id } });
  await prisma.jobApplication.deleteMany({ where: { jobId: JOB_ID, candidateProfileId: cp.id } });
  await prisma.notification.deleteMany({ where: { userId: owner.id } });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Notifications in-app', () => {
  test('une candidature génère une notification consultable par l’employeur', async ({ page }) => {
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: OWNER_EMAIL } });

    // 1. Le candidat postule.
    await loginAs(page, CAND_EMAIL);
    await page.waitForURL('/dashboard');
    await page.goto(`/emploi/${JOB_ID}`);
    // Le formulaire de candidature est rendu dans deux emplacements responsives : on cible le premier visible.
    await page.locator('textarea[name="message"]').first().fill('Candidature pour test notifications.');
    await page.getByRole('button', { name: /postuler/i }).first().click();
    await page.waitForURL('/dashboard');

    // 2. L'employeur a reçu une notification in-app.
    await expect
      .poll(async () => prisma.notification.count({ where: { userId: owner.id, type: 'job_application' } }), { timeout: 10_000 })
      .toBeGreaterThanOrEqual(1);

    // 3. L'employeur la voit dans son centre de notifications et peut tout marquer comme lu.
    await loginAs(page, OWNER_EMAIL);
    await page.waitForURL('/dashboard');
    await page.goto('/notifications');
    await expect(page.getByText(/nouvelle candidature/i).first()).toBeVisible();

    await page.getByRole('button', { name: /tout marquer comme lu/i }).click();
    await expect.poll(async () => prisma.notification.count({ where: { userId: owner.id, readAt: null } }), { timeout: 10_000 }).toBe(0);
  });
});
