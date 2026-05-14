import { defineConfig, devices } from '@playwright/test';
import { cpus } from 'os';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: cpus().length,
  reporter: process.env.CI ? [['github'], ['html']] : 'html',

  use: {
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'on',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'teardown',
      testMatch: /auth\.teardown\.ts/,
    },
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
      dependencies: ['setup'],
      teardown: 'teardown',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
