import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures';

test.describe('Admin', () => {
  test('valider une entité', async ({ page }) => {
    test.setTimeout(60_000);

    const requests: string[] = [];
    page.on('request', req => requests.push(`${req.method()} ${req.url()}`));
    page.on('response', res => requests.push(`=> ${res.status()} ${res.url()}`));

    await loginAs(page, 'admin@clubproprete.test');
    console.log('After loginAs, URL:', page.url());
    console.log('Requests during login:', requests.filter(r => r.includes('auth') || r.includes('credentials')));

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    console.log('After goto /admin, URL:', page.url());

    await expect(page.locator('table')).toBeVisible();

    const rowToValidate = page.locator('table tbody tr').filter({
      hasText: /En attente|Brouillon/,
    }).first();

    const hasPending = await rowToValidate.isVisible().catch(() => false);
    if (!hasPending) {
      await expect(page.locator('table tbody tr').first()).toBeVisible();
      return;
    }

    await page.waitForTimeout(1500);

    const statusCell = rowToValidate.locator('td').nth(2);
    const initialStatus = await statusCell.textContent();

    const validateButton = rowToValidate.getByRole('button', { name: 'Valider' });
    await validateButton.click();

    await expect.poll(async () => {
      const currentStatus = await rowToValidate.locator('td').nth(2).textContent();
      return currentStatus;
    }).not.toBe(initialStatus);

    await expect(rowToValidate.locator('td').nth(2)).toContainText('Valide');
  });
});
