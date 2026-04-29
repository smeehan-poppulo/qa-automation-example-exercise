# QA Automation Example Exercise

Playwright E2E test suite for [automationexercise.com](https://automationexercise.com) — a practice site for QA automation engineers. Covers core user journeys across Chromium, Firefox, and WebKit.

## Test Coverage

| Area | Scenarios |
|---|---|
| Home | Page title, navigation links, featured products, footer subscription |
| Products | Product listing, search (match/no-match), category/brand sidebar, navigation to detail |
| Product Detail | Product info, add to cart modal, cart navigation, review form |
| Cart | Empty cart state, add product flow, item name/price, checkout button |
| Login / Signup | Form visibility, invalid credentials error, existing email error |
| Contact Us | Form fields, successful submission, post-submit state |

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install
```

## Running Tests

```bash
# All browsers
npx playwright test

# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Specific spec file
npx playwright test tests/e2e/products.spec.ts

# Open HTML report after a run
npx playwright show-report
```

## Project Structure

```
tests/
  pages/            Page Object Models
    BasePage.ts         Shared nav locators
    HomePage.ts
    ProductsPage.ts
    ProductDetailPage.ts
    CartPage.ts
    LoginPage.ts
    ContactPage.ts
  fixtures/
    test.ts         Extended base test — auto-dismisses GDPR consent dialog
  e2e/              Test specs
    home.spec.ts
    products.spec.ts
    product-detail.spec.ts
    cart.spec.ts
    login.spec.ts
    contact.spec.ts
```

## Key Decisions

**GDPR consent dialog** — Handled automatically in the base fixture via `page.addLocatorHandler`, so no per-test boilerplate is needed.

**Screenshots** — `screenshot: 'on'` in `playwright.config.ts` captures a screenshot for every test (pass and fail). Named screenshots are also taken at key interaction points and appear as attachments in the HTML report.

**Page Object Model** — All locators live in `tests/pages/`. Tests import from `tests/fixtures/test.ts` (not directly from `@playwright/test`) to get page objects and the consent handler pre-wired.
