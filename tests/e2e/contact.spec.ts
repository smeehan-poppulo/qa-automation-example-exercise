import { test, expect } from '../fixtures/test';

test.describe('Contact Us Page', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.goto();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Automation Exercise - Contact Us');
  });

  test('displays Contact Us heading', async ({ contactPage }) => {
    await expect(contactPage.contactUsHeading).toBeVisible();
  });

  test('displays Get In Touch form heading', async ({ contactPage }) => {
    await expect(contactPage.getInTouchHeading).toBeVisible();
  });

  test('displays all contact form fields', async ({ contactPage }) => {
    await expect(contactPage.nameInput).toBeVisible();
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.subjectInput).toBeVisible();
    await expect(contactPage.messageTextarea).toBeVisible();
    await expect(contactPage.submitButton).toBeVisible();
  });

  test('displays Feedback For Us section', async ({ contactPage }) => {
    await expect(contactPage.feedbackHeading).toBeVisible();
  });

  test('submits contact form successfully', async ({ contactPage, page }) => {
    page.on('dialog', async (dialog) => dialog.accept());
    await contactPage.fillAndSubmit(
      'Test User',
      'testuser@example.com',
      'Test Subject',
      'This is a test message for automation exercise.',
    );
    await expect(contactPage.successMessage).toBeVisible();
  });

  test('home button is present after successful submission', async ({ contactPage, page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await contactPage.fillAndSubmit(
      'Test User',
      'testuser@example.com',
      'Automation Test',
      'Message from automated test.',
    );
    await expect(contactPage.successMessage).toBeVisible();
    const homeButton = page.getByRole('link', { name: /Home/i }).first();
    await expect(homeButton).toBeVisible();
  });

  test('contact page URL is correct', async ({ page }) => {
    await expect(page).toHaveURL(/\/contact_us/);
  });
});
