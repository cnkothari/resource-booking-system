/**
 * ESLint config for the frontend.
 *
 * NOTE: TSLint (also requested) is deprecated since 2019; the React + TypeScript
 * ecosystem standardised on ESLint + @typescript-eslint, which we use here to
 * enforce the same naming/type rules plus React-specific hook rules.
 */
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'typeLike', format: ['PascalCase'] },
    ],
  },
  ignorePatterns: ['dist/', 'node_modules/', 'vite.config.ts', '*.cjs', '*.js'],
};
