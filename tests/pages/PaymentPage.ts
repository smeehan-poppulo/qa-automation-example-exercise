import { BasePage } from './BasePage';

export class PaymentPage extends BasePage {
  get nameOnCardInput() {
    return this.page.locator('[data-qa="name-on-card"]');
  }

  get cardNumberInput() {
    return this.page.locator('[data-qa="card-number"]');
  }

  get cvcInput() {
    return this.page.locator('[data-qa="cvc"]');
  }

  get expiryMonthInput() {
    return this.page.locator('[data-qa="expiry-month"]');
  }

  get expiryYearInput() {
    return this.page.locator('[data-qa="expiry-year"]');
  }

  get payButton() {
    return this.page.locator('[data-qa="pay-button"]');
  }

  get orderConfirmationHeading() {
    return this.page.getByText('Congratulations! Your order has been confirmed!');
  }

  async fillCardDetails(details: {
    name: string;
    number: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }) {
    await this.nameOnCardInput.fill(details.name);
    await this.cardNumberInput.fill(details.number);
    await this.cvcInput.fill(details.cvc);
    await this.expiryMonthInput.fill(details.expiryMonth);
    await this.expiryYearInput.fill(details.expiryYear);
  }
}
