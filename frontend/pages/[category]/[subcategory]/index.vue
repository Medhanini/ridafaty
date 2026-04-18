<script setup lang="ts">
import type { Article, SubCategory } from '~/types'

definePageMeta({ layout: 'default' })

const route           = useRoute()
const { t, lang }     = useLang()
const { publicFetch } = usePublicFetch()

const categorySlug    = computed(() => route.params.category    as string)
const subcategorySlug = computed(() => route.params.subcategory as string)

// ── 1. Fetch subcategory ──────────────────────────────────────────────────────
const { data: subData } = await useAsyncData(
  () => `subcategory-${subcategorySlug.value}`,
  () => publicFetch<{ success: boolean; data: SubCategory }>(`/subcategories/slug/${subcategorySlug.value}`),
  { watch: [subcategorySlug] },
)

const subcategory   = computed(() => subData.value?.data ?? null)
const subcategoryId = computed(() => subcategory.value?.id ?? null)

if (!subcategory.value) {
  throw createError({ statusCode: 404, statusMessage: 'Subcategory not found' })
}

// ── SEO ───────────────────────────────────────────────────────────────────────
useSeoMeta({
  title:       computed(() => `${subcategory.value?.name ?? ''} — ${subcategory.value?.category?.name ?? ''}`),
  description: computed(() => `${t.value.allArticles} — ${subcategory.value?.name ?? ''}`),
  ogTitle:     computed(() => subcategory.value?.name ?? ''),
})

// ── 2. Fetch articles for THIS subcategory only ───────────────────────────────
// Key includes subcategoryId so cache is isolated per subcategory.
// Watch [subcategoryId, page] ensures re-fetch when navigating between subcategories.
const page  = ref(Number(route.query.page) || 1)
const LIMIT = 12

type ArticleList = { data: Article[]; total: number }

const { data: articlesData, pending: articlesPending } = await useAsyncData(
  () => `sub-articles-${subcategoryId.value ?? 'x'}-p${page.value}`,
  () => {
    const id = subcategoryId.value
    if (!id) return Promise.resolve(null)
    return publicFetch<ArticleList>(`/articles?subCategoryId=${id}&page=${page.value}&limit=${LIMIT}`)
  },
  { watch: [subcategoryId, page, lang] },
)

const articles   = computed<Article[]>(() => articlesData.value?.data ?? [])
const totalCount = computed(() => articlesData.value?.total ?? 0)

// ── Pagination ────────────────────────────────────────────────────────────────
async function changePage(p: number) {
  page.value = p
  await navigateTo({ query: { page: p > 1 ? p : undefined } }, { replace: true })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const breadcrumb = computed(() => [
  { label: t.value.home,                              to: '/' },
  { label: subcategory.value?.category?.name ?? '',   to: `/${categorySlug.value}` },
  { label: subcategory.value?.name ?? '' },
])
</script>

<template>
  <div>
    <!-- ── Page header band ─────────────────────────────────────────────────── -->
    <div class="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb :items="breadcrumb" class="mb-4" />

        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <!-- Parent category pill -->
            <NuxtLink
              v-if="subcategory?.category"
              :to="`/${categorySlug}`"
              class="mb-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-400 dark:hover:bg-brand-900"
            >{{ subcategory.category.name }}</NuxtLink>

            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
              {{ subcategory?.name }}
            </h1>
          </div>

          <p class="shrink-0 text-sm text-gray-400 dark:text-gray-500">
            {{ totalCount }} {{ t.allArticles.toLowerCase() }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Article grid ────────────────────────────────────────────────────── -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ArticleGrid
        :articles="articles"
        :loading="articlesPending"
        :total="totalCount"
        :page="page"
        :limit="LIMIT"
        @page-change="changePage"
      />
    </div>
  </div>
</template>
