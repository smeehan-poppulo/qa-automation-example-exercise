# Monorepo & Multi-Project Setups

> **When to use**: Running Playwright across multiple packages in a monorepo, sharing fixtures between packages, or configuring separate test projects for different app surfaces (E2E, API, visual).
> **See also**: [projects-dependencies.md](../core/projects-dependencies.md) for project config, [fixtures-hooks.md](../core/fixtures-hooks.md) for sharing fixtures, [parallel-sharding.md](parallel-sharding.md) for parallelising across packages.

## Table of Contents

1. [Single Root Config with Multiple Projects](#single-root-config-with-multiple-projects)
2. [Per-Package Configs with Root Orchestration](#per-package-configs-with-root-orchestration)
3. [Shared Fixtures Across Packages](#shared-fixtures-across-packages)
4. [Workspace-Level Path Aliases](#workspace-level-path-aliases)
5. [CI Strategy for Monorepos](#ci-strategy-for-monorepos)
6. [Anti-Patterns](#anti-patterns)

## Single Root Config with Multiple Projects

**Use when**: All test suites live in one repo and share enough config that a single `playwright.config.ts` is manageable.

```
monorepo/
  playwright.config.ts       # root config — defines all projects
  packages/
    app-web/
      tests/e2e/
    app-api/
      tests/api/
    design-system/
      tests/visual/
  shared/
    fixtures/
    helpers/
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './packages',
  fullyParallel: true,
  reporter: [['html', { outputFolder: 'playwright-report' }]],

  projects: [
    // Setup project — runs auth once
    { name: 'setup', testMatch: /global\.setup\.ts/ },

    // E2E tests for the web app
    {
      name: 'e2e-web',
      testDir: './packages/app-web/tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // API tests — no browser needed
    {
      name: 'api',
      testDir: './packages/app-api/tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'http://localhost:4000',
      },
    },

    // Visual regression — separate snapshot baseline per browser
    {
      name: 'visual-chromium',
      testDir: './packages/design-system/tests/visual',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Run a single project:

```bash
npx playwright test --project=api
npx playwright test --project=e2e-web
```

## Per-Package Configs with Root Orchestration

**Use when**: Packages are large enough to warrant independent configs, or teams own different packages and need to run tests in isolation.

```
monorepo/
  package.json               # root — orchestrates via npm workspaces / Turborepo
  playwright.config.base.ts  # shared defaults
  packages/
    app-web/
      playwright.config.ts   # extends base
      tests/
    app-api/
      playwright.config.ts
      tests/
```

```typescript
// playwright.config.base.ts
import { defineConfig } from '@playwright/test';

export const baseConfig = defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
});
```

```typescript
// packages/app-web/playwright.config.ts
import { defineConfig } from '@playwright/test';
import { baseConfig } from '../../playwright.config.base';

export default defineConfig(baseConfig, {
  testDir: './tests',
  use: {
    baseURL: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
  },
});
```

```json
// package.json — root orchestration
{
  "scripts": {
    "test": "npm run test --workspaces --if-present",
    "test:web": "npm run test -w packages/app-web",
    "test:api": "npm run test -w packages/app-api"
  }
}
```

### Turborepo pipeline

```json
// turbo.json
{
  "pipeline": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["playwright-report/**", "test-results/**"],
      "cache": false
    }
  }
}
```

```bash
# Run tests only for packages affected by the current branch
npx turbo run test --filter=...[origin/main]
```

## Shared Fixtures Across Packages

**Use when**: Multiple packages need the same authenticated client, seeded data, or utility fixtures — define them once in a shared package.

```
shared/
  fixtures/
    index.ts        # re-exports all shared fixtures
    auth.fixture.ts
    api.fixture.ts
  helpers/
    ApiClient.ts
  types/
    index.ts
```

```typescript
// shared/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';

export interface AuthFixtures {
  authToken: string;
}

export const authFixtures = base.extend<AuthFixtures>({
  authToken: async ({ request }, use) => {
    const resp = await request.post('/auth/token', {
      data: { clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET },
    });
    const { access_token } = await resp.json();
    await use(access_token);
  },
});
```

```typescript
// shared/fixtures/index.ts
import { mergeTests } from '@playwright/test';
import { authFixtures } from './auth.fixture';
import { apiFixtures } from './api.fixture';

export const test = mergeTests(authFixtures, apiFixtures);
export { expect } from '@playwright/test';
```

```typescript
// packages/app-web/tests/my.spec.ts
import { test, expect } from '../../shared/fixtures';

test('authenticated request', async ({ authToken, request }) => {
  const resp = await request.get('/api/profile', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(resp.ok()).toBeTruthy();
});
```

### TypeScript path aliases for the shared package

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "paths": {
      "@shared/fixtures": ["./shared/fixtures/index.ts"],
      "@shared/helpers/*": ["./shared/helpers/*"],
      "@shared/types": ["./shared/types/index.ts"]
    }
  }
}
```

## Workspace-Level Path Aliases

**Use when**: Test files in `packages/app-web` need to import from `shared/` without deep relative paths.

```typescript
// Before
import { test } from '../../../shared/fixtures';

// After
import { test } from '@shared/fixtures';
```

Ensure the root `tsconfig.json` is on the TypeScript resolution path for all packages, or use `extends` in per-package tsconfigs:

```json
// packages/app-web/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  }
}
```

## CI Strategy for Monorepos

**Use when**: Running tests in CI — only test packages affected by the current change rather than the full suite.

### GitLab CI with path-based rules

```yaml
# .gitlab-ci.yml
test:web:
  script: npx playwright test --project=e2e-web
  rules:
    - changes:
        - packages/app-web/**/*
        - shared/**/*

test:api:
  script: npx playwright test --project=api
  rules:
    - changes:
        - packages/app-api/**/*
        - shared/**/*

test:visual:
  script: npx playwright test --project=visual-chromium
  rules:
    - changes:
        - packages/design-system/**/*
```

### Artifact sharing between packages

```yaml
test:setup:
  script: npx playwright test --project=setup
  artifacts:
    paths:
      - .auth/

test:e2e:
  needs: [test:setup]
  script: npx playwright test --project=e2e-web
  artifacts:
    paths:
      - playwright-report/
    when: always
```

## Anti-Patterns

| Don't Do This                                              | Problem                                                   | Do This Instead                                          |
| ---------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| Duplicate fixture code in each package                     | Changes must be applied N times                           | Extract to a `shared/fixtures` package                   |
| Run all packages' tests on every commit                    | Slow CI, high noise for unrelated changes                 | Use path-based rules or Turborepo `--filter`             |
| Use absolute paths instead of aliases for shared imports   | Breaks when the monorepo structure changes                | Configure workspace-level path aliases                   |
| Different base configs per package with no shared defaults | Config drift; packages diverge on retry/reporter settings | Extend a shared `playwright.config.base.ts`              |
| Mix E2E and unit tests in the same Playwright project      | Slows E2E runs; different reporters needed                | Separate into distinct projects with their own `testDir` |

## Related References

- **Project configuration**: See [projects-dependencies.md](../core/projects-dependencies.md)
- **Shared fixtures**: See [fixtures-hooks.md](../core/fixtures-hooks.md)
- **Parallel execution**: See [parallel-sharding.md](parallel-sharding.md)
- **CI/CD pipelines**: See [ci-cd.md](ci-cd.md) and [gitlab.md](gitlab.md)
