import { test, expect } from '../fixtures/test';

test.describe('Products Page', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - All Products');
    await page.screenshot({ path: 'test-results/screenshots/products-title.png' });
  });

  test('displays All Products heading', async ({ productsPage }) => {
    await expect(productsPage.allProductsHeading).toBeVisible();
    await productsPage.page.screenshot({ path: 'test-results/screenshots/products-heading.png' });
  });

  test('displays product list with multiple items', async ({ productsPage }) => {
    await expect(productsPage.productCards.first()).toBeVisible();
    const count = await productsPage.productCards.count();
    expect(count).toBeGreaterThan(5);
    await productsPage.page.screenshot({ path: 'test-results/screenshots/products-list.png' });
  });

  test('displays search input and button', async ({ productsPage }) => {
    await expect(productsPage.searchInput).toBeVisible();
    await productsPage.page.screenshot({ path: 'test-results/screenshots/products-search-input.png' });
  });

  test('searches for a product and shows results', async ({ productsPage, page }) => {
    await productsPage.searchFor('Top');
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    await expect(productsPage.productCards.first()).toBeVisible();
    const count = await productsPage.productCards.count();
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/screenshots/products-search-results.png' });
  });

  test('search for non-matching term shows no products', async ({ productsPage, page }) => {
    await productsPage.searchFor('xyznotarealproduct12345');
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    const count = await productsPage.productCards.count();
    expect(count).toBe(0);
    await page.screenshot({ path: 'test-results/screenshots/products-search-no-results.png' });
  });

  test('each product card has a View Product link', async ({ productsPage }) => {
    await expect(productsPage.viewProductLinks.first()).toBeVisible();
    await productsPage.page.screenshot({ path: 'test-results/screenshots/products-view-product-links.png' });
  });

  test('navigates to product detail page via View Product link', async ({ productsPage, page }) => {
    await productsPage.viewProductLinks.first().click();
    await expect(page).toHaveURL(/\/product_details\/\d+/);
    await expect(page).toHaveTitle('Automation Exercise - Product Details');
    await page.screenshot({ path: 'test-results/screenshots/products-nav-to-detail.png' });
  });

  test('displays category section with Women, Men, Kids', async ({ productsPage }) => {
    await expect(productsPage.categorySection).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Women/i }).first()).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Men/i }).first()).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Kids/i }).first()).toBeVisible();
    await productsPage.page.screenshot({ path: 'test-results/screenshots/products-categories.png' });
  });

  test('displays brands section', async ({ productsPage }) => {
    await expect(productsPage.brandsSection).toBeVisible();
    await expect(productsPage.page.getByRole('link', { name: /Polo/i })).toBeVisible();
    await productsPage.page.screenshot({ path: 'test-results/screenshots/products-brands.png' });
  });
});
