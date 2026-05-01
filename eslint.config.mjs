import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['playwright-report/**', 'test-results/**', 'dist/**'] },

  // TypeScript rules across all .ts files
  ...tseslint.configs.recommended,

  // Playwright rules scoped to test files only
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // ({}) in worker fixture declarations is idiomatic Playwright — allow it
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
    },
  },

  // Must be last — disables ESLint rules that conflict with Prettier formatting
  prettier,
);
