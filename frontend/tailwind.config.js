/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // Tell Tailwind where to look for class names so it can tree-shake unused
  // styles in production. Nuxt's @nuxtjs/tailwindcss module handles this
  // automatically, but an explicit list is safer for edge cases.
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],

  theme: {
    extend: {
      // Design tokens – override / extend as needed
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },

  plugins: [],
}
