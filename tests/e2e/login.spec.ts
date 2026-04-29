import { test, expect } from '../fixtures/test';

test.describe('Login / Signup Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - Signup / Login');
    await page.screenshot({ path: 'test-results/screenshots/login-title.png' });
  });

  test('displays login form heading', async ({ loginPage }) => {
    await expect(loginPage.loginHeading).toBeVisible();
    await loginPage.page.screenshot({ path: 'test-results/screenshots/login-heading.png' });
  });

  test('displays login form with email and password fields', async ({ loginPage }) => {
    await expect(loginPage.loginEmailInput).toBeVisible();
    await expect(loginPage.loginPasswordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await loginPage.page.screenshot({ path: 'test-results/screenshots/login-form-fields.png' });
  });

  test('displays signup form heading', async ({ loginPage }) => {
    await expect(loginPage.signupHeading).toBeVisible();
    await loginPage.page.screenshot({ path: 'test-results/screenshots/login-signup-heading.png' });
  });

  test('displays signup form with name and email fields', async ({ loginPage }) => {
    await expect(loginPage.signupNameInput).toBeVisible();
    await expect(loginPage.signupEmailInput).toBeVisible();
    await expect(loginPage.signupButton).toBeVisible();
    await loginPage.page.screenshot({ path: 'test-results/screenshots/login-signup-form.png' });
  });

  test('shows error for invalid login credentials', async ({ loginPage, page }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await expect(loginPage.loginErrorMessage).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/login-invalid-credentials-error.png' });
  });

  test('shows error when logging in with empty email', async ({ loginPage, page }) => {
    await loginPage.login('', 'somepassword');
    // Browser validation prevents submission — email field is required
    await expect(loginPage.loginEmailInput).toBeFocused();
    await page.screenshot({ path: 'test-results/screenshots/login-empty-email-error.png' });
  });

  test('shows error for existing email on signup', async ({ loginPage, page }) => {
    // Use a known existing account email from the site
    await loginPage.signup('Test User', 'test@test.com');
    await expect(loginPage.signupErrorMessage).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/login-signup-existing-email-error.png' });
  });

  test('login page URL is correct', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });
});
