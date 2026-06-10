import { defineConfig, devices } from '@playwright/test';

const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? 3456);
const e2eBaseURL = `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: 1,
  // Une nouvelle tentative en local aussi : les scénarios E2E manipulent une base
  // partagée et peuvent rester sensibles aux lenteurs ponctuelles de la machine.
  retries: process.env.CI ? 2 : 1,
  reporter: 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: e2eBaseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `next start -p ${e2ePort}`,
    env: {
      AUTH_TRUST_HOST: 'true',
      NEXTAUTH_URL: e2eBaseURL,
      NEXT_PUBLIC_APP_URL: e2eBaseURL,
    },
    port: e2ePort,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
