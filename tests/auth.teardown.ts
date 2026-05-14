import { test as teardown, request } from '@playwright/test';
import fs from 'fs';
import { CREDENTIALS_PATH } from './auth-config';

teardown('delete test accounts', async ({}, testInfo) => {
  if (!fs.existsSync(CREDENTIALS_PATH)) return;

  const accounts: { email: string; password: string }[] = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, 'utf-8'),
  );

  const apiContext = await request.newContext({
    baseURL: testInfo.project.use.baseURL!,
  });

  await Promise.all(
    accounts.map(({ email, password }) =>
      apiContext.delete('/api/deleteAccount', { form: { email, password } }),
    ),
  );

  await apiContext.dispose();
  fs.rmSync(CREDENTIALS_PATH, { force: true });
});