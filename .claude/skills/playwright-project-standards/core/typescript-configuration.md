# TypeScript Configuration for Playwright

> **When to use**: Setting up TypeScript for a Playwright project, extending fixture types, writing type-safe helpers, or troubleshooting type errors in tests.
> **See also**: [fixtures-hooks.md](fixtures-hooks.md) for typed custom fixtures, [configuration.md](configuration.md) for playwright.config.ts options.

## Table of Contents

1. [tsconfig Setup](#tsconfig-setup)
2. [Typing Custom Fixtures](#typing-custom-fixtures)
3. [Type-Safe Page Objects](#type-safe-page-objects)
4. [Type Guards in Tests](#type-guards-in-tests)
5. [Path Aliases](#path-aliases)
6. [Anti-Patterns](#anti-patterns)

## tsconfig Setup

### Recommended tsconfig.json

**Use when**: Starting a new Playwright TypeScript project or tightening an existing config.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@fixtures/*": ["src/fixtures/*"],
      "@helpers/*": ["src/helpers/*"],
      "@pages/*": ["src/pages/*"]
    }
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "playwright.config.ts"],
  "exclude": ["node_modules", "dist", "playwright-report", "test-results"]
}
```

### Separate tsconfig for tests

**Use when**: Test files need different settings from source (e.g. looser type checking, different module resolution).

```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node", "@playwright/test"]
  },
  "include": ["tests/**/*.ts", "src/fixtures/**/*.ts", "playwright.config.ts"]
}
```

Reference it in `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    /* ... */
  },
  // Playwright picks up tsconfig.json automatically; to use a custom one:
});
```

And in `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit --project tsconfig.test.json"
  }
}
```

## Typing Custom Fixtures

### Extending the base test type

**Use when**: Adding project-specific fixtures — always declare types explicitly so callers get IDE autocomplete and errors on misuse.

```typescript
// src/fixtures/index.ts
import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { ApiClient } from '@helpers/ApiClient';

// Declare the shape of all custom fixtures
interface AppFixtures {
  loginPage: LoginPage;
  apiClient: ApiClient;
  authenticatedPage: Page;
}

// Options are override-able per test / per config
interface AppOptions {
  userRole: 'admin' | 'viewer' | 'editor';
}

export const test = base.extend<AppFixtures & AppOptions>({
  userRole: ['viewer', { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  authenticatedPage: async ({ page, userRole }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env[`${userRole.toUpperCase()}_EMAIL`]!);
    await page.getByLabel('Password').fill(process.env[`${userRole.toUpperCase()}_PASSWORD`]!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await use(page);
  },
});

export { expect };
```

```typescript
// Override option per test
test.use({ userRole: 'admin' });

test('admin sees settings panel', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByRole('link', { name: 'Settings' })).toBeVisible();
});
```

### Worker-scoped fixture types

```typescript
// Fixtures in the second type parameter are worker-scoped
export const test = base.extend<AppFixtures, { workerApiToken: string }>({
  workerApiToken: [
    async ({}, use, workerInfo) => {
      const token = await fetchTokenForWorker(workerInfo.workerIndex);
      await use(token);
    },
    { scope: 'worker' },
  ],
});
```

## Type-Safe Page Objects

**Use when**: Defining page object methods that return locators or data — explicit return types prevent silent regressions when selectors change.

```typescript
// src/pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: string;
}

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly statsPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.statsPanel = page.getByTestId('stats-panel');
  }

  async getStats(): Promise<DashboardStats> {
    return {
      totalUsers: parseInt(await this.statsPanel.getByTestId('total-users').innerText(), 10),
      activeUsers: parseInt(await this.statsPanel.getByTestId('active-users').innerText(), 10),
      revenue: await this.statsPanel.getByTestId('revenue').innerText(),
    };
  }

  async navigateTo(section: 'users' | 'reports' | 'settings'): Promise<void> {
    await this.page.getByRole('link', { name: section, exact: false }).click();
    await this.page.waitForURL(`**/${section}`);
  }
}
```

## Type Guards in Tests

**Use when**: Narrowing union types from API responses or conditional UI states before asserting.

```typescript
import { test, expect } from '@playwright/test';

interface SuccessResponse {
  status: 'success';
  data: { id: number; name: string };
}

interface ErrorResponse {
  status: 'error';
  message: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function isSuccess(resp: ApiResponse): resp is SuccessResponse {
  return resp.status === 'success';
}

test('create item returns typed success response', async ({ request }) => {
  const raw = await (await request.post('/api/items', { data: { name: 'Widget' } })).json();
  const resp = raw as ApiResponse;

  if (!isSuccess(resp)) {
    throw new Error(`Expected success, got error: ${resp.message}`);
  }

  // TypeScript now knows resp.data exists
  expect(resp.data.id).toEqual(expect.any(Number));
  expect(resp.data.name).toBe('Widget');
});
```

## Path Aliases

**Use when**: Deep import paths like `../../../../fixtures` clutter test files — aliases make imports stable under reorganisation.

Configure aliases in `tsconfig.json` (see above), then register them so Node can resolve them at runtime:

```bash
npm install -D tsconfig-paths
```

```json
// package.json
{
  "scripts": {
    "test": "playwright test"
  }
}
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
// ts-node / Playwright's own transpilation handles path aliases automatically
// when tsconfig.json is in the project root — no extra setup needed.

export default defineConfig({
  /* ... */
});
```

```typescript
// Before: brittle relative path
import { test } from '../../../fixtures';

// After: stable alias
import { test } from '@fixtures';
```

## Anti-Patterns

| Don't Do This                            | Problem                                             | Do This Instead                            |
| ---------------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| `any` return types on fixtures           | Removes IDE autocomplete; errors surface at runtime | Declare explicit fixture interface         |
| `as any` to silence type errors in tests | Masks real contract mismatches                      | Use type guards or fix the underlying type |
| `// @ts-ignore` in test files            | Hides breakage when types are updated               | Narrow the type or fix the source type     |
| Implicit `any` from `response.json()`    | No safety on field access                           | Cast to a typed interface or use Zod       |
| `strict: false` in tsconfig              | Allows null/undefined bugs to reach runtime         | Enable `strict: true` and address errors   |

## Related References

- **Custom fixtures**: See [fixtures-hooks.md](fixtures-hooks.md)
- **Typed API helpers**: See [api-testing.md](../testing-patterns/api-testing.md#typed-requestresponse-helpers)
- **Configuration**: See [configuration.md](configuration.md)
