// Flat ESLint configuration (migrated from legacy). Supports TS, React, Expo RN, Jest.
const { defineConfig } = require('eslint/config');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const jest = require('eslint-plugin-jest');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
  {
    ignores: [
      'dist/**',
      '.expo/**',
      // keep server ignored until stabilized
      'server/**',
    ],
  },
  // Base for JS/TS application code
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
      globals: {
        console: 'readonly',
        __DEV__: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      jest,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
    },
  rules: {
      // TypeScript / code quality
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-redeclare': ['warn', { ignoreDeclarationMerge: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // React
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/self-closing-comp': 'warn',
      'react/jsx-key': ['warn', { checkFragmentShorthand: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      // Accessibility (web-centric rules still useful in RN + testing env)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-role': 'warn',
      // Imports
  'import/no-duplicates': 'warn',
  'import/order': ['warn', { groups: ['builtin','external','internal','parent','sibling','index'], 'newlines-between': 'always' }],
      'import/no-named-as-default': 'off',
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      eqeqeq: ['warn', 'smart'],
      curly: ['warn', 'multi-line'],
    },
  },
  // Enforce no inline hex in app UI code only (allow theme, scripts, tests, and service internals)
  {
    files: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message: 'Do not use inline hex colors in UI. Use palette tokens via useAppPalette().',
        },
      ],
    },
  },
  // Relax the inline-hex restriction for theme, scripts, test files
  {
    files: ['theme/**/*.ts', 'scripts/**/*', '**/__tests__/**/*', '**/*.test.*'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Disallow dynamic require in jurisdictions data (enforce static imports for Metro compatibility)
  {
    files: ['data/jurisdictions/**/*.ts'],
    rules: {
      'import/no-dynamic-require': 'error',
      'global-require': 'error'
    }
  },
  // Scripts (Node context)
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      // Allow verbose logging in maintenance/utility scripts
      'no-console': 'off',
    },
  },
  // Jest tests
  {
    files: ['**/__tests__/**/*', '**/*.test.*'],
    plugins: { jest },
    languageOptions: {
      globals: {
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
    },
  },
]);
