<script setup lang="ts">
import type { Category } from '~/types'

const { t, lang, langOptions, setLang, isRTL } = useLang()
const { isDark, toggle: toggleDark } = useColorMode()
const { publicFetch } = usePublicFetch()

// Load categories for nav links, filtered by active language
const { data: categoriesData } = await useAsyncData(
  () => `nav-categories-${lang.value}`,
  () => publicFetch<{ data: Category[]; total: number }>(`/categories?limit=8&lang=${lang.value}`),
  { watch: [lang] },
)
const categories = computed<Category[]>(() => categoriesData.value?.data ?? [])

const mobileOpen   = ref(false)
const langOpen     = ref(false)
const langRef      = ref<HTMLElement | null>(null)

// Close lang dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', onOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onOutsideClick)
})
function onOutsideClick(e: MouseEvent) {
  if (langRef.value && !langRef.value.contains(e.target as Node)) {
    langOpen.value = false
  }
}

function selectLang(code: typeof lang.value) {
  setLang(code)
  langOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <nav class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

      <!-- Logo -->
      <NuxtLink :to="`/${lang}/`" class="shrink-0 text-xl font-extrabold tracking-tight text-brand-600 dark:text-brand-400">
        Idafaty
      </NuxtLink>

      <!-- Desktop category links -->
      <ul class="hidden items-center gap-1 overflow-hidden md:flex">
        <li>
          <NuxtLink
            :to="`/${lang}/`"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            active-class="text-brand-600 dark:text-brand-400"
          >{{ t.home }}</NuxtLink>
        </li>
        <li v-for="cat in categories" :key="cat.id">
          <NuxtLink
            :to="`/${lang}/${cat.slug}`"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            active-class="text-brand-600 dark:text-brand-400"
          >{{ cat.name }}</NuxtLink>
        </li>
      </ul>

      <!-- Right controls -->
      <div class="flex items-center gap-2">

        <!-- Dark mode toggle -->
        <button
          type="button"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          @click="toggleDark"
        >
          <!-- Sun icon (shown in dark mode) -->
          <svg v-if="isDark" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon icon (shown in light mode) -->
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Language switcher -->
        <div ref="langRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="langOpen = !langOpen"
          >
            <svg class="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{{ langOptions.find(o => o.code === lang)?.label ?? 'FR' }}</span>
            <svg class="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div
              v-if="langOpen"
              :class="[
                'absolute top-full mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800',
                isRTL ? 'left-0' : 'right-0',
              ]"
            >
              <button
                v-for="opt in langOptions"
                :key="opt.code"
                type="button"
                :class="[
                  'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
                  opt.code === lang
                    ? 'font-semibold text-brand-600 dark:text-brand-400'
                    : 'text-gray-700 dark:text-gray-300',
                ]"
                @click="selectLang(opt.code)"
              >
                <span>{{ opt.native }}</span>
                <span class="text-xs text-gray-400">{{ opt.label }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- Mobile hamburger -->
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <template v-if="!mobileOpen">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </template>
            <template v-else>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </template>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div v-if="mobileOpen" class="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <ul class="flex flex-col px-4 py-3 gap-0.5">
          <li>
            <NuxtLink
              :to="`/${lang}/`"
              class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800"
              active-class="text-brand-600 dark:text-brand-400"
              @click="mobileOpen = false"
            >{{ t.home }}</NuxtLink>
          </li>
          <li v-for="cat in categories" :key="cat.id">
            <NuxtLink
              :to="`/${lang}/${cat.slug}`"
              class="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800"
              active-class="text-brand-600 dark:text-brand-400"
              @click="mobileOpen = false"
            >{{ cat.name }}</NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>
