import { defineConfig, devices } from '@playwright/test';
import { cpus } from 'os';

const browsers = [
  { name: 'chromium', device: 'Desktop Chrome' },
  { name: 'firefox', device: 'Desktop Firefox' },
  { name: 'webkit',  device: 'Desktop Safari' },
];

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
    ...browsers.map(({ name, device }) => ({
      name,
      testIgnore: ['**/api/**/*.spec.ts', '**/e2e/checkout.spec.ts'],
      use: { ...devices[device] },
    })),
    ...browsers.map(({ name, device }) => ({
      name: `authenticated-${name}`,
      testMatch: '**/e2e/checkout.spec.ts',
      dependencies: ['setup'],
      teardown: 'teardown',
      use: { ...devices[device] },
    })),
  ],
});
