<script setup lang="ts">
import type { Article, Category } from '~/types'

definePageMeta({ layout: 'default' })

const { t, lang } = useLang()
const { publicFetch } = usePublicFetch()

useSeoMeta({
  title: computed(() => 'Idafaty'),
  description: computed(() => t.value.highlights + ' — Idafaty'),
  ogTitle: 'Idafaty',
  ogType: 'website',
})

// ── Fetch highlights (latest 5 articles) ────────────────────────────────────
type ArticleList   = { data: Article[];  total: number }
type CategoryList  = { data: Category[]; total: number }

const { data: highlightsData, pending: highlightsPending } = await useAsyncData<ArticleList | null>(
  'home-highlights',
  () => publicFetch<ArticleList>('/articles?limit=5&page=1'),
  { watch: [lang] },
)
const highlights = computed<Article[]>(() => highlightsData.value?.data ?? [])

// ── Fetch categories ─────────────────────────────────────────────────────────
const { data: categoriesData } = await useAsyncData<CategoryList | null>(
  'home-categories',
  () => publicFetch<CategoryList>('/categories?limit=12'),
  { watch: [lang] },
)
const categories = computed<Category[]>(() => categoriesData.value?.data ?? [])
</script>

<template>
  <div>
    <!-- Page wrapper with max-width container -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      <!-- Hero / Highlights section -->
      <HeroSection
        :articles="highlights"
        :loading="highlightsPending"
      />

      <!-- Divider -->
      <hr v-if="categories.length > 0" class="border-gray-100 dark:border-gray-800" />

      <!-- Per-category sections (lazy-loaded via IntersectionObserver) -->
      <template v-if="categories.length > 0">
        <template v-for="(category, idx) in categories" :key="category.id">
          <CategorySection :category="category" />
          <hr
            v-if="idx < categories.length - 1"
            class="border-gray-100 dark:border-gray-800"
          />
        </template>
      </template>

      <!-- If no categories fetched yet, show a loading hint -->
      <div v-else-if="!categories.length && highlightsPending" class="py-8">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ArticleCardSkeleton v-for="i in 4" :key="i" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>
