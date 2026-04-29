import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  productUrl(id: number) {
    return `/product_details/${id}`;
  }

  get productName() {
    return this.page.locator('.product-information h2');
  }

  get productPrice() {
    return this.page.locator('.product-information span span');
  }

  get productCategory() {
    return this.page.locator('.product-information p').filter({ hasText: 'Category' });
  }

  get productAvailability() {
    return this.page.locator('.product-information p').filter({ hasText: 'Availability' });
  }

  get productBrand() {
    return this.page.locator('.product-information p').filter({ hasText: 'Brand' });
  }

  get quantityInput() {
    return this.page.getByRole('spinbutton');
  }

  get addToCartButton() {
    return this.page.getByRole('button', { name: /Add to cart/i });
  }

  get reviewNameInput() {
    return this.page.getByRole('textbox', { name: 'Your Name' });
  }

  get reviewEmailInput() {
    return this.page.locator('#review-form #email');
  }

  get reviewTextArea() {
    return this.page.getByRole('textbox', { name: 'Add Review Here!' });
  }

  get reviewSubmitButton() {
    return this.page.locator('#button-review');
  }

  get cartModal() {
    return this.page.locator('#cartModal');
  }

  get viewCartModalLink() {
    return this.page.locator('#cartModal').getByRole('link', { name: /View Cart/i });
  }

  get continueShoppingButton() {
    return this.page.locator('#cartModal').getByRole('button', { name: /Continue Shopping/i });
  }

  async goto(id: number) {
    await this.page.goto(this.productUrl(id));
  }

  async addToCart() {
    await this.addToCartButton.click();
    await this.cartModal.waitFor({ state: 'visible' });
  }
}
