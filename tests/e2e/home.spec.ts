import { test, expect } from '../fixtures/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise');
    await page.screenshot({ path: 'test-results/screenshots/home-title.png' });
  });

  test('displays logo and navigation links', async ({ homePage }) => {
    await expect(homePage.logo).toBeVisible();
    await expect(homePage.navHome).toBeVisible();
    await expect(homePage.navProducts).toBeVisible();
    await expect(homePage.navCart).toBeVisible();
    await expect(homePage.navSignupLogin).toBeVisible();
    await expect(homePage.navContactUs).toBeVisible();
    await homePage.page.screenshot({ path: 'test-results/screenshots/home-navigation.png' });
  });

  test('displays featured products section', async ({ homePage }) => {
    await expect(homePage.featuredProductsHeading).toBeVisible();
    await expect(homePage.productCards.first()).toBeVisible();
    await homePage.page.screenshot({ path: 'test-results/screenshots/home-featured-products.png' });
  });

  test('displays subscription section in footer', async ({ homePage }) => {
    await expect(homePage.subscriptionHeading).toBeVisible();
    await expect(homePage.footerSubscriptionInput).toBeVisible();
    await homePage.page.screenshot({ path: 'test-results/screenshots/home-footer-subscription.png' });
  });

  test('navigates to products page via nav link', async ({ homePage, page }) => {
    await homePage.navProducts.click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/home-nav-to-products.png' });
  });

  test('navigates to login page via nav link', async ({ homePage, page }) => {
    await homePage.navSignupLogin.click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/home-nav-to-login.png' });
  });

  test('navigates to contact page via nav link', async ({ homePage, page }) => {
    await homePage.navContactUs.click();
    await expect(page).toHaveURL(/\/contact_us/);
    await expect(page.getByRole('heading', { name: /Contact Us/i })).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/home-nav-to-contact.png' });
  });
});
