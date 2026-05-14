import { test as setup, chromium, request } from '@playwright/test';
import fs from 'fs';
import { AUTH_DIR, CREDENTIALS_PATH } from './auth-config';

setup('create test accounts', async ({}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  const poolSize = testInfo.config.workers;
  const password = process.env.TEST_ACCOUNT_PASSWORD ?? 'LocalDev-Only!';

  if (process.env.CI && !process.env.TEST_ACCOUNT_PASSWORD) {
    throw new Error('TEST_ACCOUNT_PASSWORD must be set in CI');
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const timestamp = Date.now();

  const accounts = await Promise.all(
    Array.from({ length: poolSize }, async (_, i) => {
      const email = `checkout_test_${timestamp}_${i}@example.com`;

      const apiContext = await request.newContext({ baseURL });
      await apiContext.post('/api/createAccount', {
        form: {
          name: 'Checkout Test',
          email,
          password,
          title: 'Mr',
          birth_date: '1',
          birth_month: '1',
          birth_year: '1990',
          firstname: 'Checkout',
          lastname: 'Test',
          company: '',
          address1: '123 Test Street',
          address2: '',
          country: 'Canada',
          zipcode: '12345',
          state: 'Ontario',
          city: 'Toronto',
          mobile_number: '5550001111',
        },
      });
      await apiContext.dispose();

      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addLocatorHandler(
        page.getByRole('button', { name: 'Consent' }),
        async (btn) => { await btn.click(); },
      );

      await page.goto(`${baseURL}/login`);
      await page.locator('[data-qa="login-email"]').fill(email);
      await page.locator('[data-qa="login-password"]').fill(password);
      await page.locator('[data-qa="login-button"]').click();
      await page.locator('a', { hasText: 'Logged in as' }).waitFor({ timeout: 15_000 });

      await context.storageState({ path: `${AUTH_DIR}/user-${i}.json` });
      await browser.close();

      return { email, password };
    })
  );

  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(accounts));
});