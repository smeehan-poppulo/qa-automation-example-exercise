import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly url = '/';

  get heroSection() {
    return this.page.locator('.carousel-inner, #slider-carousel, .features_items').first();
  }

  get featuredProductsHeading() {
    return this.page.getByRole('heading', { name: /Features Items/i });
  }

  get productCards() {
    return this.page.locator('.features_items .productinfo');
  }

  get categoryHeading() {
    return this.page.getByRole('heading', { name: 'Category' });
  }

  get brandsHeading() {
    return this.page.getByRole('heading', { name: 'Brands' });
  }

  get subscriptionHeading() {
    return this.page.getByRole('heading', { name: 'Subscription' });
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
