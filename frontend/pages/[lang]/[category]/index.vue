<script setup lang="ts">
import type { Article, Category, SubCategory } from '~/types'

definePageMeta({
  layout: 'default',
  validate: (route) => ['fr', 'en', 'ar'].includes(route.params.lang as string),
})

const route           = useRoute()
const { t, lang }     = useLang()
const { publicFetch } = usePublicFetch()

const categorySlug = computed(() => route.params.category as string)

const { data: categoryData, error: categoryError } = await useAsyncData(
  () => `category-${categorySlug.value}-${lang.value}`,
  () => publicFetch<{ success: boolean; data: Category }>(`/categories/slug/${categorySlug.value}?lang=${lang.value}`),
  { watch: [categorySlug, lang] },
)

const category = computed(() => categoryData.value?.data ?? null)

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

useSeoMeta({
  title:       computed(() => category.value?.name ?? ''),
  description: computed(() => `${t.value.allArticles} — ${category.value?.name ?? ''}`),
  ogTitle:     computed(() => category.value?.name ?? ''),
})

const page  = ref(Number(route.query.page) || 1)
const LIMIT = 12

type ArticleList = { data: Article[]; total: number }

const { data: articlesData, pending: articlesPending } = await useAsyncData(
  () => `category-articles-${categorySlug.value}-${page.value}`,
  () => publicFetch<ArticleList>(
    `/articles?categoryId=${category.value!.id}&page=${page.value}&limit=${LIMIT}&lang=${lang.value}`,
  ),
  { watch: [page, lang] },
)

const articles    = computed<Article[]>(() => articlesData.value?.data ?? [])
const totalCount  = computed(() => articlesData.value?.total ?? 0)

const subcategories = computed<SubCategory[]>(
  () => (category.value as Category & { subCategories?: SubCategory[] })?.subCategories ?? [],
)

async function changePage(p: number) {
  page.value = p
  await navigateTo({ query: { page: p > 1 ? p : undefined } }, { replace: true })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const breadcrumb = computed(() => [
  { label: t.value.home, to: `/${lang.value}/` },
  { label: category.value?.name ?? '' },
])
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

    <Breadcrumb :items="breadcrumb" class="mb-6" />

    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
        {{ category?.name }}
      </h1>
      <p v-if="totalCount > 0" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ totalCount }} {{ t.allArticles.toLowerCase() }}
      </p>
    </div>

    <div v-if="subcategories.length > 0" class="mb-8">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {{ t.subcategories }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="sub in subcategories"
          :key="sub.id"
          :to="`/${lang}/${categorySlug}/${sub.slug}`"
          class="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-950 dark:hover:text-brand-300"
        >
          {{ sub.name }}
          <span
            v-if="(sub as SubCategory & { _count?: { articles: number } })._count?.articles"
            class="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-brand-900 dark:group-hover:text-brand-400"
          >{{ (sub as SubCategory & { _count?: { articles: number } })._count!.articles }}</span>
        </NuxtLink>
      </div>
    </div>

    <hr class="mb-8 border-gray-100 dark:border-gray-800" />

    <ArticleGrid
      :articles="articles"
      :loading="articlesPending"
      :total="totalCount"
      :page="page"
      :limit="LIMIT"
      @page-change="changePage"
    />
  </div>
</template>
