// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // SSR is enabled by default; explicit for clarity
  ssr: true,

  // Global CSS entry point
  css: ['~/assets/css/main.css'],

  // Modules
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', 'nuxt-gtag', '@nuxtjs/sitemap'],

  // Register components/shared/ without the "Shared" path prefix so that
  // <AppAlert>, <AppModal>, <RichEditor> resolve correctly in templates.
  components: [
    { path: '~/components/shared', pathPrefix: false },
    { path: '~/components/home',   pathPrefix: false },
    '~/components',
  ],

  // TypeScript strict mode
  typescript: {
    strict: true,
    typeCheck: false, // run tsc separately to avoid blocking dev server
  },

  // App-level head defaults (SEO baseline)
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Idafaty',
      titleTemplate: '%s | Idafaty',
      meta: [
        {
          name: 'description',
          content: 'Idafaty – actualités et articles en français, anglais et arabe.',
        },
        { name: 'theme-color', content: '#ffffff' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Idafaty' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Runtime config – public values are exposed to the client,
  // private values stay server-side only.
  runtimeConfig: {
    // Server-only secrets (populated from env vars at runtime)
    apiSecret: '',
    // Internal base URL used during SSR (Docker service name)
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL ?? 'http://backend:3001/api',
    // Public values (safe to expose to the browser)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api',
      appName: 'Idafaty',
      // nuxt-gtag reads this automatically — set NUXT_PUBLIC_GTAG_ID in env
      gtag: {
        id: process.env.NUXT_PUBLIC_GTAG_ID ?? '',
      },
    },
  },

  // ── Google Analytics (nuxt-gtag) ────────────────────────────────────────────
  // ID is injected at runtime via runtimeConfig.public.gtag.id — no rebuild needed.
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    loadingStrategy: 'defer',
    initMode: 'auto',
  },

  // ── Sitemap ─────────────────────────────────────────────────────────────────
  sitemap: {
    // Dynamic URLs are fetched from this Nitro server route at request time.
    sources: ['/api/__sitemap__/urls'],
    // Exclude admin/auth routes from the sitemap
    exclude: ['/login', '/admin/**', '/articles/create', '/articles/*/edit'],
    xslColumns: [
      { label: 'URL', width: '65%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Priority', select: 'sitemap:priority', width: '10%' },
    ],
  },

  // ── Site metadata (used by @nuxtjs/sitemap for the hostname) ────────────────
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://idafaty.com',
    name: 'Idafaty',
  },

  // Nitro (server engine) config
  nitro: {
    compressPublicAssets: true,
  },

  // Vite build tweaks
  vite: {
    build: {
      // Raise the chunk-size warning threshold (optional)
      chunkSizeWarningLimit: 1000,
    },
  },
})
