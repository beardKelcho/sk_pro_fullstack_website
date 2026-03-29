import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  // Build artifact, üretilen dosyalar ve non-TS config dosyaları lintlenmez
  {
    ignores: [
      '.next/**',
      'out/**',
      'android/**',
      'node_modules/**',
      'next-env.d.ts',   // Next.js tarafından üretilir
      'jest.setup.js',   // Jest setup - JSX transform gerektirir ama TS değil
      'jest.config.*',
      'next.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      'electron/**',
      'cypress/**',
      'public/**',
    ],
  },
  // TypeScript / TSX dosyaları
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Mevcut kodda ts-ignore ve require kullanımları var — uyarı ver, hata değil
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/triple-slash-reference': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Prettier uyumu (format kurallarını devre dışı bırakır)
  prettier,
];
