import { test, expect } from '../fixtures/test';

test.describe('Cart Page', () => {
  test('shows empty cart message when no items added', async ({ cartPage, page }) => {
    await cartPage.goto();
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.shoppingCartBreadcrumb).toBeVisible();
  });

  test('has correct page title', async ({ cartPage, page }) => {
    await cartPage.goto();
    await expect(page).toHaveTitle('Automation Exercise - Checkout');
  });

  test('empty cart contains link to products page', async ({ cartPage, page }) => {
    await cartPage.goto();
    const shopLink = page.getByRole('link', { name: 'here' });
    await expect(shopLink).toBeVisible();
  });

  test('empty cart shop link navigates to products', async ({ cartPage, page }) => {
    await cartPage.goto();
    await page.getByRole('link', { name: 'here' }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('shows product in cart after adding from product detail', async ({ productDetailPage, cartPage, page }) => {
    await productDetailPage.goto(1);
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartModal).toBeVisible();

    await productDetailPage.viewCartModalLink.click();
    await expect(page).toHaveURL(/\/view_cart/);
    await expect(cartPage.cartTable).toBeVisible();
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('cart shows product name and price', async ({ productDetailPage, cartPage, page }) => {
    await productDetailPage.goto(1);
    await productDetailPage.addToCart();
    await productDetailPage.viewCartModalLink.click();

    const cartItem = cartPage.cartItems.first();
    await expect(cartItem.getByText('Blue Top')).toBeVisible();
    await expect(cartItem.getByText('Rs. 500').first()).toBeVisible();
  });

  test('cart displays Proceed To Checkout button when items present', async ({ productDetailPage, cartPage, page }) => {
    await productDetailPage.goto(1);
    await productDetailPage.addToCart();
    await productDetailPage.viewCartModalLink.click();
    await expect(cartPage.proceedToCheckoutButton).toBeVisible();
  });
});
