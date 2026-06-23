/**
 * ESLint config for the backend.
 *
 * NOTE: TSLint was requested, but TSLint has been deprecated since 2019 and the
 * TypeScript team officially migrated linting to `typescript-eslint`. We therefore
 * use ESLint + @typescript-eslint, which is the modern, supported equivalent and
 * enforces the same naming-convention / type-safety rules TSLint used to provide.
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Functional-style backend: discourage classes for domain logic.
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ClassDeclaration[superClass=null]',
        message:
          'Prefer functional programming. Classes are only allowed for TypeORM entities and Error subclasses.',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'variableLike', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
      { selector: 'typeLike', format: ['PascalCase'] },
    ],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.cjs'],
  overrides: [
    {
      // Entities use decorators + classes by design.
      files: ['src/entities/*.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
