<script setup lang="ts">
import type { Article } from '~/types'

defineProps<{
  articles: Article[]
  loading: boolean
}>()

const { t } = useLang()
</script>

<template>
  <section class="py-10">
    <!-- Section heading -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white">
        {{ t.highlights }}
      </h2>
      <!-- No "view all" here — category sections below serve that purpose -->
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ArticleCardSkeleton size="lg" />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ArticleCardSkeleton v-for="i in 4" :key="i" size="sm" />
        </div>
      </div>
    </div>

    <!-- No articles fallback -->
    <div v-else-if="articles.length === 0" class="rounded-2xl bg-white py-12 text-center shadow-sm dark:bg-gray-800">
      <p class="text-sm text-gray-400 dark:text-gray-500">{{ t.noArticles }}</p>
    </div>

    <!-- Hero grid: 1 large + up to 4 small -->
    <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <!-- Featured article -->
      <ArticleCard :article="articles[0]" size="lg" />

      <!-- Secondary articles (2×2 grid) -->
      <div v-if="articles.length > 1" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ArticleCard
          v-for="article in articles.slice(1, 5)"
          :key="article.id"
          :article="article"
          size="sm"
        />
      </div>
    </div>
  </section>
</template>
