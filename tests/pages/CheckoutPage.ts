import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly url = '/checkout';

  get deliveryAddress() {
    return this.page.locator('#address_delivery');
  }

  get cartInfoTable() {
    return this.page.locator('#cart_info');
  }

  get cartItems() {
    return this.page.locator('#cart_info tbody tr.cart_quantity');
  }

  get commentField() {
    return this.page.locator('#ordermsg');
  }

  get placeOrderButton() {
    return this.page.getByRole('link', { name: 'Place Order' });
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
