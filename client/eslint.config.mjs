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
      // Keep lint stable when plugin/parser major versions drift on dependency PRs.
      '@typescript-eslint/no-duplicate-enum-values': 'off',
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
  {
    files: ['src/__tests__/**/*.{ts,tsx}', 'scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['src/app/admin/**/*.{ts,tsx}', 'src/components/admin/**/*.{ts,tsx}', 'src/services/**/*.{ts,tsx}'],
    rules: {
      // Legacy admin/service katmanında `any` birikimi yüksek. Burada lint'i
      // kullanılabilir tutmak için önce daha sinyalli uyarıları görünür bırakıyoruz.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/utils/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // Prettier uyumu (format kurallarını devre dışı bırakır)
  prettier,
];
