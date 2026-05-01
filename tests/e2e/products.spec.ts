import { test, expect } from '../fixtures/test';

test.describe('Products Page', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - All Products');
  });

  test('displays All Products heading', async ({ productsPage }) => {
    await expect(productsPage.allProductsHeading).toBeVisible();
  });

  test('displays product list with multiple items', { tag: '@smoke' }, async ({ productsPage }) => {
    await expect(productsPage.productCards.first()).toBeVisible();
    const count = await productsPage.productCards.count();
    expect(count).toBeGreaterThan(5);
  });

  test('displays search input and button', async ({ productsPage }) => {
    await expect(productsPage.searchInput).toBeVisible();
  });

  test('searches for a product and shows results', async ({ productsPage }) => {
    await productsPage.searchFor('Top');
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    await expect(productsPage.productCards.first()).toBeVisible();
    const count = await productsPage.productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search for non-matching term shows no products', async ({ productsPage }) => {
    await productsPage.searchFor('xyznotarealproduct12345');
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    await expect(productsPage.productCards).toHaveCount(0);
  });

  test('each product card has a View Product link', async ({ productsPage }) => {
    await expect(productsPage.viewProductLinks.first()).toBeVisible();
  });

  test('navigates to product detail page via View Product link', async ({ productsPage, page }) => {
    // toPass retries the click if the Google vignette intercepts the first attempt
    await expect(async () => {
      await productsPage.viewProductLinks.first().click();
      await expect(page).toHaveURL(/\/product_details\/\d+/, { timeout: 5000 });
    }).toPass({ timeout: 20000 });
    await expect(page).toHaveTitle('Automation Exercise - Product Details');
  });

  test('displays category section with Women, Men, Kids', async ({ productsPage }) => {
    await expect(productsPage.categorySection).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Women/i }).first()).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Men/i }).first()).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Kids/i }).first()).toBeVisible();
  });

  test('displays brands section', async ({ productsPage }) => {
    await expect(productsPage.brandsSection).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Polo/i })).toBeVisible();
  });
});
