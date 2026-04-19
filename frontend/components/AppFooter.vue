<script setup lang="ts">
import type { Category } from '~/types'

const { t, lang, langOptions } = useLang()
const { publicFetch } = usePublicFetch()
const year = new Date().getFullYear()

const { data: categoriesData } = await useAsyncData(
  () => `footer-categories-${lang.value}`,
  () => publicFetch<{ data: Category[]; total: number }>(`/categories?limit=8&lang=${lang.value}`),
  { watch: [lang] },
)
const categories = computed<Category[]>(() => categoriesData.value?.data ?? [])

const quickLinks = computed(() => [
  { label: t.value.home,    to: '/'        },
  { label: t.value.about,   to: '/about'   },
  { label: t.value.contact, to: '/contact' },
])

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  },
  {
    name: 'Twitter / X',
    href: 'https://twitter.com',
    icon: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z M9.75 15.02l5.75-3.02-5.75-3.02v6.04z',
  },
]
</script>

<template>
  <footer class="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <!-- Top section: 3 columns -->
      <div class="grid grid-cols-1 gap-10 md:grid-cols-3">

        <!-- Brand column -->
        <div>
          <NuxtLink to="/" class="text-2xl font-extrabold tracking-tight text-brand-600 dark:text-brand-400">
            Idafaty
          </NuxtLink>
          <p class="mt-3 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {{ t.about }}
          </p>
          <!-- Social links -->
          <div class="mt-5 flex items-center gap-3">
            <a
              v-for="s in socialLinks"
              :key="s.name"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="s.name"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-brand-600 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-600 dark:hover:text-white"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path :d="s.icon"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick links -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {{ t.quickLinks }}
          </h3>
          <ul class="mt-4 space-y-2">
            <li v-for="link in quickLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
              >{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Categories -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {{ t.categories }}
          </h3>
          <ul class="mt-4 space-y-2">
            <li v-for="cat in categories" :key="cat.id">
              <NuxtLink
                :to="`/${cat.slug}`"
                class="text-sm text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
              >{{ cat.name }}</NuxtLink>
            </li>
            <li v-if="categories.length === 0" class="text-sm text-gray-400 dark:text-gray-600">—</li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 sm:flex-row">
        <p class="text-xs text-gray-400 dark:text-gray-600">
          © {{ year }} Idafaty. {{ t.rights }}.
        </p>
        <div class="flex items-center gap-4">
          <p class="text-xs text-gray-400 dark:text-gray-600">
            {{ t.language }}: {{ langOptions?.find(o => o.code === lang)?.native }}
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-gray-400 transition-colors hover:text-brand-600 dark:text-gray-600 dark:hover:text-brand-400"
          >Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
</template>
