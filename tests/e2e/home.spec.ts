import { test, expect } from '../fixtures/test';

test.describe('Home Page', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('has correct page title', { tag: '@smoke' }, async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise');
  });

  test('displays logo and navigation links', async ({ homePage }) => {
    await expect(homePage.logo).toBeVisible();
    await expect(homePage.navHome).toBeVisible();
    await expect(homePage.navProducts).toBeVisible();
    await expect(homePage.navCart).toBeVisible();
    await expect(homePage.navSignupLogin).toBeVisible();
    await expect(homePage.navContactUs).toBeVisible();
  });

  test('displays featured products section', async ({ homePage }) => {
    await expect(homePage.featuredProductsHeading).toBeVisible();
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('displays subscription section in footer', async ({ homePage }) => {
    await expect(homePage.subscriptionHeading).toBeVisible();
    await expect(homePage.footerSubscriptionInput).toBeVisible();
  });

  test('navigates to products page via nav link', async ({ homePage, page }) => {
    // toPass retries the click if the Google vignette intercepts the first attempt
    await expect(async () => {
      await homePage.navProducts.click();
      await expect(page).toHaveURL(/\/products/, { timeout: 5000 });
    }).toPass({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  });

  test('navigates to login page via nav link', async ({ homePage, page }) => {
    await expect(async () => {
      await homePage.navSignupLogin.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }).toPass({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
  });

  test('navigates to contact page via nav link', async ({ homePage, page }) => {
    await expect(async () => {
      await homePage.navContactUs.click();
      await expect(page).toHaveURL(/\/contact_us/, { timeout: 5000 });
    }).toPass({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Contact Us/i })).toBeVisible();
  });
});
