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
    // Google GPT intercepts navigation clicks and calls history.pushState /
    // history.replaceState to add #google_vignette to the URL before showing
    // the vignette overlay. Block those calls so the original click can proceed.
    // The hashchange listener is a fallback for any path that bypasses the API.
    await page.addInitScript(() => {
      const origPush = history.pushState.bind(history);
      const origReplace = history.replaceState.bind(history);
      history.pushState = (data, unused, url?) => {
        if (typeof url === 'string' && url.includes('google_vignette')) return;
        origPush(data, unused, url);
      };
      history.replaceState = (data, unused, url?) => {
        if (typeof url === 'string' && url.includes('google_vignette')) return;
        origReplace(data, unused, url);
      };
      window.addEventListener('hashchange', () => {
        if (location.hash.includes('google_vignette'))
          origReplace(null, '', location.pathname + location.search);
      });
    });

    await page.addLocatorHandler(
      page.getByRole('button', { name: 'Consent' }),
      async (btn) => { await btn.click(); },
    );
    // Fallback for when the vignette renders an iframe despite the script above.
    // Google wraps its ad iframes in <ins> elements; chain into the nested frame
    // to reach the close button (no visible text, selected by role only).
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
