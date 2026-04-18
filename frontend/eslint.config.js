import pluginVue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'

export default [
  // 1. Global ignores
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'coverage/**',
    ],
  },

  // 2. Vue single-file components
  {
    files: ['**/*.vue'],
    plugins: { vue: pluginVue, '@typescript-eslint': tseslint },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules,
      'vue/multi-word-component-names': 'off', // Nuxt pages/layouts are single-word
      'vue/require-default-prop': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  },

  // 3. TypeScript / JS files
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { '@typescript-eslint': tseslint },
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module' },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 4. Prettier must come last to disable conflicting formatting rules
  prettier,
]
