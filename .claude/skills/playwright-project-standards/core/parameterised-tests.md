# Parameterised & Dynamic Tests

> **When to use**: Running the same test logic against multiple inputs, environments, roles, or configurations without duplicating test code.
> **See also**: [test-data.md](test-data.md) for data factories, [test-tags.md](test-tags.md) for filtering parameterised suites, [fixtures-hooks.md](fixtures-hooks.md) for option-based fixtures.

## Table of Contents

1. [Basic Parameterisation with for…of](#basic-parameterisation-with-forof)
2. [test.describe.configure](#testdescribeconfigure)
3. [Option-Based Fixtures](#option-based-fixtures)
4. [Metadata-Driven Test Generation](#metadata-driven-test-generation)
5. [Cross-Environment Parameterisation](#cross-environment-parameterisation)
6. [Anti-Patterns](#anti-patterns)

## Basic Parameterisation with for…of

**Use when**: The same test steps apply to a small, well-defined set of inputs.
**Avoid when**: The input set is large or loaded from an external source — use metadata-driven generation instead.

```typescript
import { test, expect } from '@playwright/test';

const roles = [
  { name: 'admin', canDelete: true, canExport: true },
  { name: 'editor', canDelete: false, canExport: true },
  { name: 'viewer', canDelete: false, canExport: false },
] as const;

for (const { name, canDelete, canExport } of roles) {
  test(`${name} sees correct action buttons`, async ({ page }) => {
    await page.goto(`/dashboard?role=${name}`);

    const deleteBtn = page.getByRole('button', { name: 'Delete' });
    const exportBtn = page.getByRole('button', { name: 'Export' });

    await expect(deleteBtn)[canDelete ? 'toBeVisible' : 'toBeHidden']();
    await expect(exportBtn)[canExport ? 'toBeVisible' : 'toBeHidden']();
  });
}
```

### Parameterised API tests

```typescript
const endpoints = [
  { method: 'GET', path: '/api/items', expectedStatus: 200 },
  { method: 'POST', path: '/api/items', expectedStatus: 401 },
  { method: 'DELETE', path: '/api/items/1', expectedStatus: 401 },
] as const;

for (const { method, path, expectedStatus } of endpoints) {
  test(`unauthenticated ${method} ${path} returns ${expectedStatus}`, async ({ request }) => {
    const resp = await request[method.toLowerCase() as 'get' | 'post' | 'delete'](path);
    expect(resp.status()).toBe(expectedStatus);
  });
}
```

## test.describe.configure

### Serial execution for dependent tests

**Use when**: A `describe` block contains tests that must run in order (e.g. a multi-step workflow). Use sparingly — serial tests cannot run in parallel and are harder to debug.

```typescript
test.describe('checkout flow', () => {
  test.describe.configure({ mode: 'serial' });

  let orderId: string;

  test('add item to cart', async ({ page }) => {
    await page.goto('/products');
    await page.getByText('Add to cart').first().click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('proceed to checkout', async ({ page }) => {
    await page.goto('/cart');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.waitForURL('/checkout');
  });

  test('complete purchase', async ({ page }) => {
    await page.goto('/checkout');
    // ... fill form ...
    await page.getByRole('button', { name: 'Pay' }).click();
    orderId = await page.getByTestId('order-id').innerText();
    await expect(page.getByText('Order confirmed')).toBeVisible();
  });

  test('order appears in history', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByText(orderId)).toBeVisible();
  });
});
```

### Parallel describe within a serial file

```typescript
// Force the whole file to run serially across workers
test.describe.configure({ mode: 'serial' });

// Or override a nested describe to run its tests in parallel
test.describe('independent checks', () => {
  test.describe.configure({ mode: 'parallel' });

  test('check A', async ({ page }) => {
    /* ... */
  });
  test('check B', async ({ page }) => {
    /* ... */
  });
});
```

## Option-Based Fixtures

**Use when**: The same fixture behaves differently per test — expose it as a Playwright option so callers can override per test or per `describe`.

```typescript
// src/fixtures/index.ts
import { test as base } from '@playwright/test';

interface Options {
  locale: 'en' | 'fr' | 'de' | 'es';
  theme: 'light' | 'dark';
}

interface Fixtures {
  localePage: import('@playwright/test').Page;
}

export const test = base.extend<Options & Fixtures>({
  locale: ['en', { option: true }],
  theme: ['light', { option: true }],

  localePage: async ({ page, locale, theme }, use) => {
    await page.addInitScript(
      ({ locale, theme }) => {
        localStorage.setItem('locale', locale);
        localStorage.setItem('theme', theme);
      },
      { locale, theme }
    );
    await use(page);
  },
});
```

```typescript
// Run the same tests for multiple locales
const locales = ['en', 'fr', 'de'] as const;

for (const locale of locales) {
  test.describe(`locale: ${locale}`, () => {
    test.use({ locale });

    test('navigation labels are translated', async ({ localePage }) => {
      await localePage.goto('/');
      // assert locale-specific text
    });
  });
}
```

## Metadata-Driven Test Generation

**Use when**: Test cases are defined in a separate data file (JSON, CSV, or TypeScript) that non-engineers can update without touching test code.

```typescript
// tests/data/form-validation-cases.ts
export interface ValidationCase {
  field: string;
  value: string;
  expectedError: string;
}

export const validationCases: ValidationCase[] = [
  { field: 'email', value: 'not-an-email', expectedError: 'Enter a valid email address' },
  { field: 'email', value: '', expectedError: 'Email is required' },
  { field: 'phone', value: '123', expectedError: 'Phone number must be at least 10 digits' },
  { field: 'postcode', value: 'AAAAA', expectedError: 'Enter a valid postcode' },
];
```

```typescript
// tests/form-validation.spec.ts
import { test, expect } from '@playwright/test';
import { validationCases } from './data/form-validation-cases';

test.describe('form validation', () => {
  for (const { field, value, expectedError } of validationCases) {
    test(`${field}: "${value}" shows "${expectedError}"`, async ({ page }) => {
      await page.goto('/signup');
      await page.getByLabel(field, { exact: false }).fill(value);
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByText(expectedError)).toBeVisible();
    });
  }
});
```

## Cross-Environment Parameterisation

**Use when**: The same smoke tests must pass across multiple environments — generate one test per environment rather than duplicating files.

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

const environments = ['staging', 'emea', 'us'] as const;

export default defineConfig({
  projects: environments.map((env) => ({
    name: `smoke-${env}`,
    testMatch: /smoke\.spec\.ts/,
    use: {
      baseURL: process.env[`BASE_URL_${env.toUpperCase()}`],
    },
    metadata: { environment: env },
  })),
});
```

```typescript
// tests/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Poppulo/);

  // Annotate with which environment ran
  testInfo.annotations.push({ type: 'environment', description: String(testInfo.project.metadata.environment) });
});
```

## Anti-Patterns

| Don't Do This                                                | Problem                                                                  | Do This Instead                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Copy-paste the same test with different literals             | Maintenance burden; fixes must be applied N times                        | Parameterise with `for...of`                                      |
| `test.describe.configure({ mode: 'serial' })` on every suite | Disables parallelism project-wide; slows CI                              | Use serial mode only for genuinely order-dependent flows          |
| Parameterise over too many dimensions at once                | Test names become unreadable; failures are hard to diagnose              | Split into separate describe blocks if dimensions are independent |
| Generate tests dynamically from a network call               | Flaky if the network call fails; undefined test count at collection time | Load test data from local files only                              |
| Use the same snapshot name in a parameterised loop           | Snapshots overwrite each other                                           | Include the parameter value in the snapshot name                  |

## Related References

- **Test data factories**: See [test-data.md](test-data.md)
- **Test tags and filtering**: See [test-tags.md](test-tags.md)
- **Fixture options**: See [fixtures-hooks.md](fixtures-hooks.md#fixture-with-options)
- **Cross-environment config**: See [projects-dependencies.md](projects-dependencies.md)
