import { test, expect } from '../fixtures/test';

test.describe('Product Detail Page', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ productDetailPage }) => {
    await productDetailPage.goto(1);
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - Product Details');
  });

  test('displays product name', async ({ productDetailPage }) => {
    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productName).toHaveText('Blue Top');
  });

  test('displays product price', async ({ productDetailPage }) => {
    await expect(productDetailPage.productPrice).toBeVisible();
    await expect(productDetailPage.productPrice).toContainText('Rs.');
  });

  test('displays product category', async ({ productDetailPage }) => {
    await expect(productDetailPage.productCategory).toBeVisible();
    await expect(productDetailPage.productCategory).toContainText('Category');
  });

  test('displays availability and brand information', async ({ productDetailPage }) => {
    await expect(productDetailPage.productAvailability).toContainText('Availability');
    await expect(productDetailPage.productBrand).toContainText('Brand');
  });

  test('displays quantity input and add to cart button', async ({ productDetailPage }) => {
    await expect(productDetailPage.quantityInput).toBeVisible();
    await expect(productDetailPage.addToCartButton).toBeVisible();
  });

  test('adds product to cart and shows modal', { tag: '@smoke' }, async ({ productDetailPage }) => {
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartModal).toBeVisible();
  });

  test('navigates to cart via View Cart in modal', async ({ productDetailPage, page }) => {
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartModal).toBeVisible();
    await productDetailPage.viewCartModalLink.click();
    await expect(page).toHaveURL(/\/view_cart/);
    await expect(page).toHaveTitle(/Checkout/);
  });

  test('displays review form', async ({ productDetailPage }) => {
    await expect(productDetailPage.reviewNameInput).toBeVisible();
    await expect(productDetailPage.reviewEmailInput).toBeVisible();
    await expect(productDetailPage.reviewTextArea).toBeVisible();
    await expect(productDetailPage.reviewSubmitButton).toBeVisible();
  });
});
