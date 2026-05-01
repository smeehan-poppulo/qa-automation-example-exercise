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
    await page.addLocatorHandler(
      page.getByRole('button', { name: 'Consent' }),
      async (btn) => { await btn.click(); },
    );
    await page.addLocatorHandler(
      page.frameLocator('#google_vignette').getByText('Close'),
      async (close) => { await close.click(); },
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
