import { test, expect } from '../fixtures/test';

test.describe('Login / Signup Page', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - Signup / Login');
  });

  test('displays login form heading', async ({ loginPage }) => {
    await expect(loginPage.loginHeading).toBeVisible();
  });

  test('displays login form with email and password fields', async ({ loginPage }) => {
    await expect(loginPage.loginEmailInput).toBeVisible();
    await expect(loginPage.loginPasswordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('displays signup form heading', async ({ loginPage }) => {
    await expect(loginPage.signupHeading).toBeVisible();
  });

  test('displays signup form with name and email fields', async ({ loginPage }) => {
    await expect(loginPage.signupNameInput).toBeVisible();
    await expect(loginPage.signupEmailInput).toBeVisible();
    await expect(loginPage.signupButton).toBeVisible();
  });

  test('shows error for invalid login credentials', { tag: '@smoke' }, async ({ loginPage }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await expect(loginPage.loginErrorMessage).toBeVisible();
  });

  test('shows error when logging in with empty email', async ({ loginPage }) => {
    await loginPage.login('', 'somepassword');
    // Browser validation prevents submission — email field is required
    await expect(loginPage.loginEmailInput).toBeFocused();
  });

  test('shows error for existing email on signup', async ({ loginPage }) => {
    // Use a known existing account email from the site
    await loginPage.signup('Test User', 'test@test.com');
    await expect(loginPage.signupErrorMessage).toBeVisible();
  });

  test('login page URL is correct', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });
});
