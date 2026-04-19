<script setup lang="ts">
import type { Article, Category } from '~/types'

const props = defineProps<{
  category: Category
}>()

const { t, lang } = useLang()
const { publicFetch } = usePublicFetch()

// ── Intersection Observer — only fetch when section enters viewport ───────────

const sectionRef   = ref<HTMLElement | null>(null)
const articles     = ref<Article[]>([])
const loading      = ref(false)
const fetched      = ref(false)

onMounted(() => {
  if (!window.IntersectionObserver) {
    fetchArticles()
    return
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !fetched.value) {
        observer.disconnect()
        fetchArticles()
      }
    },
    { rootMargin: '200px' },
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
  onBeforeUnmount(() => observer.disconnect())
})

// Re-fetch when language changes (only if section was already loaded)
watch(lang, () => { if (fetched.value) fetchArticles() })

async function fetchArticles() {
  loading.value = true
  fetched.value = true
  try {
    const result = await publicFetch<{ data: Article[]; total: number }>(
      `/articles?categoryId=${props.category.id}&limit=4&page=1&lang=${lang.value}`,
    )
    articles.value = result?.data ?? []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section ref="sectionRef" class="py-8">
    <!-- Section heading -->
    <div class="mb-5 flex items-center justify-between">
      <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">
        {{ category.name }}
      </h2>
      <NuxtLink
        :to="`/${category.slug}`"
        class="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >{{ t.viewAll }}</NuxtLink>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ArticleCardSkeleton v-for="i in 4" :key="i" size="sm" />
    </div>

    <!-- Placeholder before section is visible (prevents layout shift) -->
    <div v-else-if="!fetched" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ArticleCardSkeleton v-for="i in 4" :key="i" size="sm" />
    </div>

    <!-- No articles -->
    <div v-else-if="articles.length === 0" class="rounded-2xl bg-white py-8 text-center shadow-sm dark:bg-gray-800">
      <p class="text-sm text-gray-400 dark:text-gray-500">{{ t.noArticles }}</p>
    </div>

    <!-- Article cards grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        size="sm"
      />
    </div>
  </section>
</template>
