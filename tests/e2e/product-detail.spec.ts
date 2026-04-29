import { test, expect } from '../fixtures/test';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ productDetailPage }) => {
    await productDetailPage.goto(1);
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - Product Details');
    await page.screenshot({ path: 'test-results/screenshots/product-detail-title.png' });
  });

  test('displays product name', async ({ productDetailPage }) => {
    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productName).toHaveText('Blue Top');
    await productDetailPage.page.screenshot({ path: 'test-results/screenshots/product-detail-name.png' });
  });

  test('displays product price', async ({ productDetailPage }) => {
    await expect(productDetailPage.productPrice).toBeVisible();
    await expect(productDetailPage.productPrice).toContainText('Rs.');
    await productDetailPage.page.screenshot({ path: 'test-results/screenshots/product-detail-price.png' });
  });

  test('displays product category', async ({ productDetailPage }) => {
    await expect(productDetailPage.productCategory).toBeVisible();
    await expect(productDetailPage.productCategory).toContainText('Category');
    await productDetailPage.page.screenshot({ path: 'test-results/screenshots/product-detail-category.png' });
  });

  test('displays availability and brand information', async ({ productDetailPage }) => {
    await expect(productDetailPage.productAvailability).toContainText('Availability');
    await expect(productDetailPage.productBrand).toContainText('Brand');
    await productDetailPage.page.screenshot({ path: 'test-results/screenshots/product-detail-info.png' });
  });

  test('displays quantity input and add to cart button', async ({ productDetailPage }) => {
    await expect(productDetailPage.quantityInput).toBeVisible();
    await expect(productDetailPage.addToCartButton).toBeVisible();
    await productDetailPage.page.screenshot({ path: 'test-results/screenshots/product-detail-cart-controls.png' });
  });

  test('adds product to cart and shows modal', async ({ productDetailPage, page }) => {
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartModal).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/product-detail-add-to-cart-modal.png' });
  });

  test('navigates to cart via View Cart in modal', async ({ productDetailPage, page }) => {
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartModal).toBeVisible();
    await productDetailPage.viewCartModalLink.click();
    await expect(page).toHaveURL(/\/view_cart/);
    await expect(page).toHaveTitle(/Checkout/);
    await page.screenshot({ path: 'test-results/screenshots/product-detail-view-cart.png' });
  });

  test('displays review form', async ({ productDetailPage }) => {
    await expect(productDetailPage.reviewNameInput).toBeVisible();
    await expect(productDetailPage.reviewEmailInput).toBeVisible();
    await expect(productDetailPage.reviewTextArea).toBeVisible();
    await expect(productDetailPage.reviewSubmitButton).toBeVisible();
    await productDetailPage.page.screenshot({ path: 'test-results/screenshots/product-detail-review-form.png' });
  });
});
