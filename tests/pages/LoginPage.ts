import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly url = '/login';

  get loginHeading() {
    return this.page.getByRole('heading', { name: 'Login to your account' });
  }

  get signupHeading() {
    return this.page.getByRole('heading', { name: 'New User Signup!' });
  }

  get loginEmailInput() {
    return this.page.locator('[data-qa="login-email"]');
  }

  get loginPasswordInput() {
    return this.page.locator('[data-qa="login-password"]');
  }

  get loginButton() {
    return this.page.locator('[data-qa="login-button"]');
  }

  get loginErrorMessage() {
    return this.page.getByText('Your email or password is incorrect!');
  }

  get signupNameInput() {
    return this.page.locator('[data-qa="signup-name"]');
  }

  get signupEmailInput() {
    return this.page.locator('[data-qa="signup-email"]');
  }

  get signupButton() {
    return this.page.locator('[data-qa="signup-button"]');
  }

  get signupErrorMessage() {
    return this.page.getByText('Email Address already exist!');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async login(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }

  async signup(name: string, email: string) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }
}
