import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly url = '/products';

  get allProductsHeading() {
    return this.page.getByRole('heading', { name: 'All Products' });
  }

  get searchInput() {
    return this.page.getByPlaceholder('Search Product');
  }

  get searchButton() {
    return this.page.locator('#submit_search');
  }

  get searchedProductsHeading() {
    return this.page.getByRole('heading', { name: 'Searched Products' });
  }

  get productCards() {
    return this.page.locator('.productinfo');
  }

  get viewProductLinks() {
    return this.page.getByRole('link', { name: /View Product/i });
  }

  get categorySection() {
    return this.page.getByRole('heading', { name: 'Category' });
  }

  get brandsSection() {
    return this.page.getByRole('heading', { name: 'Brands' });
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async searchFor(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
