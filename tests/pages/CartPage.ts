import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly url = '/view_cart';

  get emptyCartMessage() {
    return this.page.getByText('Cart is empty!');
  }

  get shoppingCartBreadcrumb() {
    return this.page.getByText('Shopping Cart');
  }

  get cartTable() {
    return this.page.locator('#cart_info_table');
  }

  get cartItems() {
    return this.page.locator('#cart_info_table tbody tr');
  }

  get proceedToCheckoutButton() {
    return this.page.locator('a.check_out');
  }

  get continueShopping() {
    return this.page.getByRole('link', { name: /here/i });
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
