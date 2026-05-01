# QA Automation Example Exercise

Playwright test suite for [automationexercise.com](https://automationexercise.com) — a practice site for QA automation engineers. Covers API contracts, core UI journeys, and a full authenticated checkout flow across Chromium, Firefox, and WebKit.

## Test Coverage

### API (`tests/api/`)

| Suite | Scenarios |
|---|---|
| Auth | Valid login, invalid credentials, missing params, unsupported methods |
| Products | Products list, brands list, search (match / no param), unsupported methods |
| Users | Create account, duplicate email, get user by email, update account, delete account, 404 after deletion |

### UI (`tests/e2e/`)

| Suite | Scenarios |
|---|---|
| Home | Page title, navigation links, featured products, footer subscription, nav routing |
| Products | Product listing, search (match/no-match), category/brand sidebar, navigation to detail |
| Product Detail | Product info fields, add to cart modal, cart navigation, review form |
| Cart | Empty state, add product flow, item name/price display, checkout button |
| Login / Signup | Form visibility, invalid credentials, existing email error |
| Contact Us | Form fields, successful submission, post-submit state |
| Checkout (authenticated) | Login → add to cart → checkout → payment → order confirmation |

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the value for local development:

```bash
cp .env.example .env
```

| Variable | Required in CI | Description |
|---|---|---|
| `TEST_ACCOUNT_PASSWORD` | Yes | Password used when creating ephemeral test accounts in global setup. Falls back to a placeholder locally; must be injected via your secrets manager in CI. |

## Type Checking and Pre-commit Hook

Type checking runs via:

```bash
npm run typecheck
```

A pre-commit hook (husky) runs this automatically on every commit. It is installed as part of `npm install` via the `prepare` lifecycle script — no manual setup needed after cloning.

The hook runs `tsc --noEmit` only. Playwright tests are intentionally excluded from the hook because they hit a live site and would take minutes per commit.

### Path aliases

`tsconfig.json` defines two aliases for use in new code:

| Alias | Resolves to |
|---|---|
| `@pages/*` | `tests/pages/*` |
| `@fixtures/*` | `tests/fixtures/*` |

Playwright's built-in TypeScript transpiler honours these automatically — no additional runtime package is required.

## Running Tests

### By tag (recommended)

```bash
npm run test:smoke       # Critical path only — fast confidence check across all layers
npm run test:regression  # Full suite
npm run test:api         # API tests only (no browser)
npm run test:ui          # All browser tests across Chromium, Firefox, WebKit
npm run test:e2e         # Authenticated full-journey tests only
```

### Other options

```bash
# All tests
npm test

# Single browser
npx playwright test --project=chromium

# Authenticated checkout tests only
npx playwright test --project=authenticated-chromium

# Specific spec file
npx playwright test tests/e2e/products.spec.ts

# Open HTML report after a run
npx playwright show-report
```

## Tagging Strategy

Every test carries one or more tags applied at the `describe` level (inherited by all tests in the suite) with additional tags on individual tests where appropriate.

| Tag | Applied at | Meaning |
|---|---|---|
| `@api` | describe | Hits REST endpoints via `request` — no browser involved |
| `@ui` | describe | Drives a real browser via Page Object Models |
| `@e2e` | describe | Multi-step authenticated user journey (checkout flow) |
| `@regression` | describe | Part of the full regression suite — applied to every suite |
| `@smoke` | individual test | One or two high-value tests per area; together they cover all layers without running everything |

`@smoke` is a strict subset of `@regression`. Running smoke on every PR and regression nightly (or pre-release) is the intended cadence.

## Parallelisation and User Pool

Workers are set to `cpus().length` — Playwright uses all available cores on any machine, including CI runners, with no hardcoded values. If the runner is upgraded (e.g. from 2-core to 4-core), parallelism scales automatically.

Unauthenticated tests are fully isolated by default (each test gets its own browser context), so they parallelize freely.

The authenticated checkout tests share session state, which would cause cart conflicts if the same account were used by multiple workers simultaneously. This is solved with a **user pool**:

- `globalSetup` creates one ephemeral account per worker in parallel (via the `createAccount` API), logs each in via a real browser, and saves a `storageState` file per worker (`playwright/.auth/user-{i}.json`).
- A worker-scoped fixture (`workerStorageState`) assigns each worker its own account using `workerIndex % poolSize`, injected via Playwright's `contextOptions` fixture so it threads through the standard context → page chain without duplicating any setup.
- `globalTeardown` deletes all accounts in parallel via the `deleteAccount` API and removes the credentials file.

The pool size is derived automatically from `config.workers`, so it always matches the actual concurrency level.

## Project Structure

```
tests/
  pages/                    Page Object Models
    BasePage.ts               Shared nav locators
    HomePage.ts
    ProductsPage.ts
    ProductDetailPage.ts
    CartPage.ts
    LoginPage.ts
    ContactPage.ts
    CheckoutPage.ts
    PaymentPage.ts
  fixtures/
    test.ts                   Base fixture — auto-dismisses GDPR consent and Google ad vignette
    authenticated.ts          Extends base fixture with per-worker storageState for checkout tests
  api/                      API test specs
    auth.spec.ts
    products.spec.ts
    users.spec.ts
  e2e/                      Browser test specs
    home.spec.ts
    products.spec.ts
    product-detail.spec.ts
    cart.spec.ts
    login.spec.ts
    contact.spec.ts
    checkout.spec.ts
  global-setup.ts           Creates ephemeral user pool, saves storageState per worker
  global-teardown.ts        Deletes all ephemeral accounts, cleans up credentials file
playwright/.auth/           Gitignored — storageState files written by global setup
.env.example                Documents required environment variables
```

## Key Decisions

**Ephemeral test accounts** — Accounts are created fresh each test run via the API and deleted on teardown. This avoids shared state between runs and keeps the test site clean. Emails use a timestamp + worker index to guarantee uniqueness even under full parallelism.

**User pool over a single shared account** — A single account used by multiple parallel workers would cause cart and session conflicts. The pool assigns one account per worker, sized automatically to match the worker count.

**`storageState` via fixture, not project config** — Setting `storageState` at the project level is static (one file). Using a worker-scoped `contextOptions` fixture allows dynamic, per-worker auth file selection while keeping all existing page fixtures and ad-dismiss handlers working unchanged.

**GDPR consent and Google ad vignette** — Both are handled automatically in the base `page` fixture via `addLocatorHandler`. Tests never need to account for these overlays explicitly.

**Page Object Model** — All locators live in `tests/pages/`. Tests import from `tests/fixtures/test.ts` or `tests/fixtures/authenticated.ts` (not directly from `@playwright/test`) to get page objects and overlay handlers pre-wired.

**`@regression` on everything** — Rather than maintaining a separate list of "regression tests", every suite carries the tag. `npm run test:regression` is always the full suite with no drift.
