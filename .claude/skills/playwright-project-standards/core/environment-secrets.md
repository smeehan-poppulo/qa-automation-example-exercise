# Environment Variables & Secrets Management

> **When to use**: Managing test credentials, API keys, environment-specific config, or validating required vars at startup.
> **See also**: [global-setup.md](global-setup.md) for validating vars before tests run, [configuration.md](configuration.md) for playwright.config.ts patterns.

## Table of Contents

1. [.env File Strategy](#env-file-strategy)
2. [Validating Required Variables](#validating-required-variables)
3. [Environment-Specific Overrides](#environment-specific-overrides)
4. [Secrets in CI](#secrets-in-ci)
5. [Typed Config Object](#typed-config-object)
6. [Anti-Patterns](#anti-patterns)

## .env File Strategy

### File layout

**Use when**: Managing multiple environments with shared defaults and per-environment overrides.

```
environment-variables/
  .env              # shared defaults, committed (no secrets)
  .env.example      # documents all required vars with placeholder values, committed
  .env.staging      # staging overrides, committed if non-secret
  .env.production   # production overrides, NOT committed
  .env.local        # developer-local overrides, NOT committed (.gitignore)
```

`.env.example` (committed — documents the contract):

```bash
# Auth
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=

# API
API_BASE_URL=https://api.staging.example.com
GRAPHQL_URL=https://api.staging.example.com/graphql

# Vault / secrets backend
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=
```

### Loading in globalSetup

```typescript
// globalSetup.ts
import { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup(config: FullConfig) {
  // Base defaults
  dotenv.config({ path: path.resolve(process.cwd(), 'environment-variables/.env') });

  // Per-environment overrides (e.g. .env.staging)
  const env = process.env.ENVIRONMENT;
  if (env) {
    dotenv.config({
      path: path.resolve(process.cwd(), `environment-variables/.env.${env}`),
      override: true,
    });
  }

  // Developer-local overrides always win
  dotenv.config({
    path: path.resolve(process.cwd(), 'environment-variables/.env.local'),
    override: true,
  });
}
```

## Validating Required Variables

**Use when**: Tests depend on specific env vars — fail fast in `globalSetup` rather than with a cryptic error mid-test.

```typescript
// src/config/validateEnv.ts
const REQUIRED_VARS = ['TEST_USER_EMAIL', 'TEST_USER_PASSWORD', 'API_BASE_URL'] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

export function validateEnv(): Record<RequiredVar, string> {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n` +
        missing.map((v) => `  ${v}`).join('\n') +
        `\n\nCopy environment-variables/.env.example and populate it.`
    );
  }

  return Object.fromEntries(REQUIRED_VARS.map((v) => [v, process.env[v]!])) as Record<RequiredVar, string>;
}
```

```typescript
// globalSetup.ts
import { validateEnv } from './src/config/validateEnv';

export default async function globalSetup() {
  // ... load dotenv files ...
  validateEnv(); // throws immediately if anything is missing
}
```

## Environment-Specific Overrides

**Use when**: Different test environments (staging, production-EU, production-US) need different base URLs or test accounts.

```typescript
// src/config/testConfig.ts
export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  testUserEmail: string;
}

const configs: Record<string, TestConfig> = {
  staging: {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://api.staging.example.com',
    testUserEmail: 'test@staging.example.com',
  },
  emea: {
    baseUrl: 'https://eu.example.com',
    apiUrl: 'https://api.eu.example.com',
    testUserEmail: 'test@eu.example.com',
  },
  us: {
    baseUrl: 'https://us.example.com',
    apiUrl: 'https://api.us.example.com',
    testUserEmail: 'test@us.example.com',
  },
};

export function getTestConfig(): TestConfig {
  const env = process.env.ENVIRONMENT;
  if (!env || !configs[env]) {
    throw new Error(`Unknown ENVIRONMENT: "${env}". Valid values: ${Object.keys(configs).join(', ')}`);
  }
  return configs[env];
}
```

## Secrets in CI

**Use when**: Storing credentials in a CI pipeline — never hardcode secrets in config files or test code.

### GitLab CI

```yaml
# .gitlab-ci.yml
variables:
  ENVIRONMENT: staging

test:
  script:
    - npx playwright test
  # Secrets come from GitLab CI/CD Variables (masked + protected)
  # Access them via $TEST_USER_PASSWORD — they are injected as env vars automatically
```

### GitHub Actions

```yaml
# .github/workflows/test.yml
- name: Run Playwright tests
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    ENVIRONMENT: staging
  run: npx playwright test
```

### Never do this

```typescript
// BAD — secret hardcoded in test file
const password = 'P@ssw0rd123!';

// BAD — secret committed in .env
TEST_USER_PASSWORD=P@ssw0rd123!
```

## Typed Config Object

**Use when**: Multiple test files need env-derived config — centralise access so changes propagate everywhere.

```typescript
// src/config/env.ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is not set`);
  return value;
}

export const env = {
  baseUrl: requireEnv('API_BASE_URL'),
  testUser: {
    email: requireEnv('TEST_USER_EMAIL'),
    password: requireEnv('TEST_USER_PASSWORD'),
  },
  admin: {
    email: requireEnv('ADMIN_EMAIL'),
    password: requireEnv('ADMIN_PASSWORD'),
  },
} as const;
```

```typescript
// tests/login.spec.ts
import { env } from '@config/env';
import { test, expect } from '@fixtures';

test('user can log in', async ({ loginPage }) => {
  await loginPage.login(env.testUser.email, env.testUser.password);
  await expect(loginPage.page).toHaveURL('/dashboard');
});
```

## Anti-Patterns

| Don't Do This                                 | Problem                                        | Do This Instead                                                             |
| --------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| Hardcode credentials in test files            | Leaks secrets in version control and logs      | Read from `process.env` via a typed config object                           |
| Commit `.env` files with real secrets         | Exposes credentials to anyone with repo access | Commit `.env.example` only; add `.env*` (except `.example`) to `.gitignore` |
| Scatter `process.env.X` reads across tests    | Changes require finding every usage            | Centralise in a typed `env` config object                                   |
| Skip validation of required vars              | Tests fail mid-run with cryptic errors         | Validate all required vars in `globalSetup` and fail fast                   |
| Use the same credentials for all environments | Production tests can corrupt staging data      | Use environment-specific test accounts                                      |
| Log secrets in test output                    | Secrets appear in CI logs                      | Never `console.log` credentials; mask them in CI variable settings          |

## Related References

- **Global setup**: See [global-setup.md](global-setup.md) for where to load and validate env vars
- **Environment config**: See [configuration.md](configuration.md) for `playwright.config.ts` patterns
- **CI/CD**: See [ci-cd.md](../infrastructure-ci-cd/ci-cd.md) for pipeline secret injection
