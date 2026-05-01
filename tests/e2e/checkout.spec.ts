import { test, expect } from '../fixtures/authenticated';

test.describe('Checkout flow (authenticated)', () => {
  test('logged-in user can purchase a product end-to-end', async ({
    productDetailPage,
    cartPage,
    checkoutPage,
    paymentPage,
    page,
  }) => {
    // Add a product to cart
    await productDetailPage.goto(1);
    await productDetailPage.addToCart();
    await productDetailPage.viewCartModalLink.click();

    // Verify cart has the item, then proceed to checkout
    await expect(page).toHaveURL(/\/view_cart/);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.proceedToCheckoutButton.click();

    // Authenticated users go directly to /checkout — no login modal
    await expect(page).toHaveURL(/\/checkout/);
    await expect(checkoutPage.deliveryAddress).toBeVisible();
    await expect(checkoutPage.cartInfoTable).toBeVisible();

    // Place the order
    await checkoutPage.placeOrderButton.click();
    await expect(page).toHaveURL(/\/payment/);

    // Fill card details and confirm
    await paymentPage.fillCardDetails({
      name: 'Checkout Test',
      number: '4111111111111111',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '2027',
    });
    await paymentPage.payButton.click();

    // Assert successful order confirmation
    await expect(paymentPage.orderConfirmationHeading).toBeVisible({ timeout: 15000 });
  });

  test('cart is accessible and shows logged-in nav state', async ({ cartPage, page }) => {
    await cartPage.goto();
    await expect(page.locator('a', { hasText: 'Logged in as' })).toBeVisible();
  });

  test('proceeding to checkout skips login modal when authenticated', async ({
    productDetailPage,
    cartPage,
    page,
  }) => {
    await productDetailPage.goto(1);
    await productDetailPage.addToCart();
    await productDetailPage.viewCartModalLink.click();
    await cartPage.proceedToCheckoutButton.click();

    // Unauthenticated users would see a modal; authenticated users land on /checkout directly
    await expect(page).toHaveURL(/\/checkout/);
  });
});
