import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  readonly url = '/contact_us';

  get contactUsHeading() {
    return this.page.getByRole('heading', { name: /Contact Us/i });
  }

  get getInTouchHeading() {
    return this.page.getByRole('heading', { name: 'Get In Touch' });
  }

  get nameInput() {
    return this.page.getByRole('textbox', { name: 'Name' });
  }

  get emailInput() {
    return this.page.locator('[data-qa="email"]');
  }

  get subjectInput() {
    return this.page.getByRole('textbox', { name: 'Subject' });
  }

  get messageTextarea() {
    return this.page.getByRole('textbox', { name: 'Your Message Here' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get successMessage() {
    return this.page.locator('#contact-page .status.alert-success');
  }

  get feedbackHeading() {
    return this.page.getByRole('heading', { name: 'Feedback For Us' });
  }

  async goto() {
    await this.page.goto(this.url);
    // Retry once with a short delay if the site returns its "under heavy load" page.
    // The existing CI retries fire immediately; this handles transient overload within a single attempt.
    if (await this.page.getByRole('heading', { name: /heavy load/i }).isVisible()) {
      await this.page.waitForTimeout(3000);
      await this.page.goto(this.url);
    }
  }

  async fillAndSubmit(name: string, email: string, subject: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.subjectInput.fill(subject);
    await this.messageTextarea.fill(message);
    await this.submitButton.click();
  }
}
