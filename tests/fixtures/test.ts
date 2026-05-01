import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { ContactPage } from '../pages/ContactPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage } from '../pages/PaymentPage';

type PageFixtures = {
  homePage: HomePage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  contactPage: ContactPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
};

export const test = base.extend<PageFixtures>({
  page: async ({ page }, use) => {
    // Google Publisher Tag (gpt.js) registers a document-level click interceptor
    // that calls event.preventDefault() and injects #google_vignette into the URL
    // before showing a full-page ad, blocking the intended navigation entirely.
    // Aborting the script prevents the interceptor from ever being registered.
    await page.route(/gpt\.js/, route => route.abort());

    // If GPT loads from an unrecognised URL, clear any #google_vignette hash so
    // subsequent toPass retries see a clean URL and can attempt navigation again.
    // Uses function syntax to avoid TypeScript optional-param syntax being
    // serialised into the browser context where it would be a syntax error.
    await page.addInitScript(function() {
      const origReplace = history.replaceState.bind(history);
      window.addEventListener('hashchange', function() {
        if (location.hash.includes('google_vignette'))
          origReplace(null, '', location.pathname + location.search);
      });
    });

    await page.addLocatorHandler(
      page.getByRole('button', { name: 'Consent' }),
      async (btn) => { await btn.click(); },
    );
    // Dismiss vignette overlays that appear despite the route block. Google serves
    // two ad formats with different iframe structures:
    //   Video ads  — single iframe level: ins > iframe > button
    //   Banner ads — nested iframe level: ins > iframe > iframe > button
    await page.addLocatorHandler(
      page.frameLocator('ins > iframe').getByRole('button').first(),
      async (btn) => { await btn.click(); },
    );
    await page.addLocatorHandler(
      page.frameLocator('ins > iframe').frameLocator('iframe').getByRole('button'),
      async (btn) => { await btn.click(); },
    );
    await use(page);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
});

export { expect } from '@playwright/test';
