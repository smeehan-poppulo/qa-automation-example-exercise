import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  use: {
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'on',
  },

  projects: [
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
    },
    {
      name: 'chromium',
      testIgnore: ['**/api/**/*.spec.ts', '**/e2e/checkout.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: ['**/api/**/*.spec.ts', '**/e2e/checkout.spec.ts'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: ['**/api/**/*.spec.ts', '**/e2e/checkout.spec.ts'],
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'authenticated-chromium',
      testMatch: '**/e2e/checkout.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
