import { Page } from '@playwright/test';

export class BasePage {
  constructor(readonly page: Page) {}

  get navHome() {
    return this.page.getByRole('banner').getByRole('link', { name: /Home/i }).first();
  }

  get navProducts() {
    return this.page.getByRole('banner').getByRole('link', { name: /Products/i });
  }

  get navCart() {
    return this.page.getByRole('banner').getByRole('link', { name: /Cart/i });
  }

  get navSignupLogin() {
    return this.page.getByRole('banner').getByRole('link', { name: /Signup/i });
  }

  get navContactUs() {
    return this.page.getByRole('banner').getByRole('link', { name: /Contact us/i });
  }

  get logo() {
    return this.page.getByRole('link', { name: 'Website for automation practice' });
  }

  get footerSubscriptionInput() {
    return this.page.getByRole('contentinfo').getByRole('textbox', { name: /email address/i });
  }
}
