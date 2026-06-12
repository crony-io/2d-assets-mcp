import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { flatConfigs } from 'eslint-plugin-import-x';
import globals from 'globals';
import ts from 'typescript-eslint';

const controlStatements = [
  'if',
  'return',
  'for',
  'while',
  'do',
  'switch',
  'try',
  'throw',
];

const paddingAroundControl = [
  ...controlStatements.flatMap((stmt) => [
    { blankLine: 'always', prev: '*', next: stmt },
    { blankLine: 'always', prev: stmt, next: '*' },
  ]),
];

export default defineConfig(
  // Configure import-x to use TypeScript resolver for path aliases
  {
    settings: {
      'import-x/resolver': {
        node: true,
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
          // Add extension aliases to help ESLint resolve .js imports to types/sources
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.d.ts', '.js'],
            '.jsx': ['.tsx', '.d.ts', '.jsx'],
            '.mjs': ['.mts', '.d.mts', '.mjs'],
          },
        },
      },
    },
  },

  // Global ignores (replaces .eslintignore)
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },

  // Base recommended JavaScript rules
  js.configs.recommended,

  // Recommended rules for import/export syntax and resolution
  flatConfigs.recommended,

  // TypeScript recommended rules
  ts.configs.recommended,

  {
    languageOptions: {
      parser: ts.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-unused-vars': 'error', // TypeScript handles this better
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            unknown: {
              message:
                'Use of `unknown` is forbidden. Please define a more specific type or interface.',
            },
          },
        },
      ],
      // --- Control Structures ---
      'curly': ['error', 'all'], // requires curly braces for all control structures
      'no-empty': ['error', { allowEmptyCatch: true }],

      // --- Naming Conventions ---
      'camelcase': [
        'error',
        { properties: 'never', ignoreDestructuring: true },
      ],

      // --- Import Ordering (Strict) ---
      'import-x/order': [
        'error',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          'alphabetize': { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-unresolved': 'error',
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],

      // --- General Best Practices ---
      'no-console': 'off', // Allowed for this CLI tool
      'prefer-template': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'object-shorthand': ['error', 'always'],
    },
  },

  // Stylistic formatting overrides
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Forces empty lines around control statements for readability
      '@stylistic/padding-line-between-statements': [
        'error',
        ...paddingAroundControl,
      ],
      // Enforce 1TBS (One True Brace Style)
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
    },
  },

  // This turns off all core ESLint rules that conflict with Prettier formatting.
  prettierConfig,
);
