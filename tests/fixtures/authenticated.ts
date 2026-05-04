import { BrowserContextOptions } from '@playwright/test';
import fs from 'fs';
import { test as base } from './test';
import { CREDENTIALS_PATH } from '../global-setup';

// Worker-scoped: each Playwright worker gets its own account from the pool,
// preventing cart/session conflicts when checkout tests run in parallel.
export const test = base.extend<
  { contextOptions: BrowserContextOptions },
  { workerStorageState: string }
>({
  workerStorageState: [async ({}, use, workerInfo) => {
    const accounts: unknown[] = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const index = workerInfo.workerIndex % accounts.length;
    await use(`playwright/.auth/user-${index}.json`);
  }, { scope: 'worker' }],

  contextOptions: async ({ contextOptions, workerStorageState }, use) => {
    await use({ ...contextOptions, storageState: workerStorageState });
  },
});

export { expect, VIGNETTE_RETRY_TIMEOUT } from './test';
