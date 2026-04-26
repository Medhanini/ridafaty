<script setup lang="ts">
import type { Article, Category } from '~/types'

definePageMeta({
  layout: 'default',
  validate: (route) => ['fr', 'en', 'ar'].includes(route.params.lang as string),
})

const { t, lang } = useLang()
const { publicFetch } = usePublicFetch()

useSeoMeta({
  title: computed(() => 'Idafaty'),
  description: computed(() => t.value.highlights + ' — Idafaty'),
  ogTitle: 'Idafaty',
  ogType: 'website',
})

type ArticleList  = { data: Article[];  total: number }
type CategoryList = { data: Category[]; total: number }

const { data: highlightsData, pending: highlightsPending } = await useAsyncData<ArticleList | null>(
  () => `home-highlights-${lang.value}`,
  () => publicFetch<ArticleList>(`/articles?limit=5&page=1&lang=${lang.value}`),
  { watch: [lang] },
)
const highlights = computed<Article[]>(() => highlightsData.value?.data ?? [])

const { data: categoriesData } = await useAsyncData<CategoryList | null>(
  () => `home-categories-${lang.value}`,
  () => publicFetch<CategoryList>(`/categories?limit=12&lang=${lang.value}`),
  { watch: [lang] },
)
const categories = computed<Category[]>(() => categoriesData.value?.data ?? [])
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      <HeroSection
        :articles="highlights"
        :loading="highlightsPending"
      />

      <hr v-if="categories.length > 0" class="border-gray-100 dark:border-gray-800" />

      <template v-if="categories.length > 0">
        <template v-for="(category, idx) in categories" :key="category.id">
          <CategorySection :category="category" />
          <hr
            v-if="idx < categories.length - 1"
            class="border-gray-100 dark:border-gray-800"
          />
        </template>
      </template>

      <div v-else-if="!categories.length && highlightsPending" class="py-8">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ArticleCardSkeleton v-for="i in 4" :key="i" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>
