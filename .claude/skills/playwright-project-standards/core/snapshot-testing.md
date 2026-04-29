# Snapshot Testing

> **When to use**: Locking in the exact output of JSON responses, serialised data structures, or rendered text — any time you want a regression alarm when output changes unexpectedly.
> **See also**: [visual-regression.md](../testing-patterns/visual-regression.md) for screenshot-based snapshots, [api-testing.md](../testing-patterns/api-testing.md) for response assertions.

## Table of Contents

1. [Text and JSON Snapshots](#text-and-json-snapshots)
2. [Snapshot Update Workflow](#snapshot-update-workflow)
3. [Parameterised Snapshots](#parameterised-snapshots)
4. [Inline Snapshots](#inline-snapshots)
5. [When to Use Snapshots vs Inline Assertions](#when-to-use-snapshots-vs-inline-assertions)
6. [Anti-Patterns](#anti-patterns)

## Text and JSON Snapshots

### Basic text snapshot

**Use when**: The exact string output of a component, API response field, or rendered content must not change without a deliberate update.
**Avoid when**: The value includes timestamps, IDs, or other volatile data — mask those first.

```typescript
import { test, expect } from '@playwright/test';

test('error message text matches snapshot', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Pay' }).click();

  const errorText = await page.getByRole('alert').innerText();
  expect(errorText).toMatchSnapshot('checkout-error.txt');
});
```

Snapshot files are stored alongside the test file in a `__snapshots__` directory by default.

### JSON snapshot from API response

**Use when**: The shape and content of an API response must remain stable — catches accidental field removal or renaming.

```typescript
test('GET /api/config returns expected structure', async ({ request }) => {
  const resp = await request.get('/api/config');
  expect(resp.status()).toBe(200);

  const body = await resp.json();

  // Mask volatile fields before snapshotting
  body.generatedAt = '[MASKED]';
  body.requestId = '[MASKED]';

  expect(JSON.stringify(body, null, 2)).toMatchSnapshot('api-config.json');
});
```

### Serialising complex objects

```typescript
test('navigation menu structure matches snapshot', async ({ page }) => {
  await page.goto('/');

  const navItems = await page.getByRole('navigation').getByRole('link').allInnerTexts();
  expect(navItems.join('\n')).toMatchSnapshot('nav-items.txt');
});
```

## Snapshot Update Workflow

### Updating snapshots intentionally

When behaviour changes deliberately, update snapshots with:

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update snapshots for one file only
npx playwright test tests/api/config.spec.ts --update-snapshots
```

### CI strategy

```typescript
// playwright.config.ts
export default defineConfig({
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  expect: {
    // Fail CI when snapshots are missing (forces intentional updates)
    toMatchSnapshot: { threshold: 0 },
  },
});
```

```yaml
# .gitlab-ci.yml — fail if any snapshot is missing or outdated
test:
  script:
    - npx playwright test
  # Never run --update-snapshots in CI automatically;
  # require a deliberate commit of updated snapshot files
```

Commit snapshot files to version control — they are the source of truth and their diffs act as a changelog for output changes.

## Parameterised Snapshots

**Use when**: The same snapshot assertion runs across multiple environments or inputs — use a unique name per variant to avoid collisions.

```typescript
const environments = ['staging', 'emea', 'us'] as const;

for (const env of environments) {
  test(`config response matches snapshot for ${env}`, async ({ request }) => {
    const resp = await request.get(`/api/config?env=${env}`);
    const body = await resp.json();
    body.generatedAt = '[MASKED]';

    expect(JSON.stringify(body, null, 2)).toMatchSnapshot(`api-config-${env}.json`);
  });
}
```

## Inline Snapshots

**Use when**: The expected value is small enough to live in the test file — avoids the file I/O of external snapshot files and makes diffs visible in code review.

```typescript
test('error response body matches', async ({ request }) => {
  const resp = await request.post('/api/items', { data: {} });
  const body = await resp.json();

  expect(JSON.stringify(body, null, 2)).toMatchInlineSnapshot(`
    "{
      "error": "Validation Error",
      "details": [
        {
          "field": "title",
          "message": "Title is required"
        }
      ]
    }"
  `);
});
```

Playwright auto-updates inline snapshot strings when you run `--update-snapshots`, so you never hand-edit them.

## When to Use Snapshots vs Inline Assertions

| Scenario                                   | Prefer                                 | Why                                                               |
| ------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------- |
| Large JSON structure with many fields      | `toMatchSnapshot` (file)               | Inline would dominate the test file                               |
| Small error body (2–5 fields)              | `toMatchInlineSnapshot`                | Diff visible in code review                                       |
| Output includes known volatile fields      | Neither — mask first, then snapshot    | Volatile data causes permanent flakiness                          |
| One or two specific field values           | `toMatchObject` / `toBe`               | Snapshots are fragile when unrelated fields change                |
| Contract regression testing across deploys | `toMatchSnapshot` (file, committed)    | File snapshots survive test runs as a historical record           |
| API schema validation                      | Zod + `safeParse` (see api-testing.md) | Runtime type checking catches drift better than string comparison |

## Anti-Patterns

| Don't Do This                                           | Problem                                                    | Do This Instead                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Snapshot volatile data (timestamps, IDs, random values) | Test fails on every run                                    | Mask or strip dynamic fields before snapshotting                  |
| Run `--update-snapshots` in CI automatically            | CI silently accepts regressions                            | Update locally, review diff, commit intentionally                 |
| Leave snapshot files out of version control             | Snapshots regenerate on every clone, defeating the purpose | Commit `__snapshots__/` directories                               |
| Snapshot entire page HTML                               | Extremely brittle; breaks on any DOM change                | Snapshot only the specific text or data you care about            |
| Use snapshots for values you can assert directly        | Obscures intent; harder to read failures                   | Use `toBe`, `toMatchObject`, or `toEqual` for simple known values |

## Related References

- **Visual regression**: See [visual-regression.md](../testing-patterns/visual-regression.md) for screenshot snapshots
- **API response validation**: See [api-testing.md](../testing-patterns/api-testing.md#schema-validation-with-zod)
- **Assertions reference**: See [assertions-waiting.md](assertions-waiting.md)
