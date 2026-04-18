<script setup lang="ts">
import type { Article } from '~/types'

const props = defineProps<{
  articles: Article[]
  loading:  boolean
  total:    number
  page:     number
  limit:    number
}>()

const emit = defineEmits<{ (e: 'page-change', p: number): void }>()

const { t } = useLang()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
const skeletons  = computed(() => Math.min(props.limit, 12))
</script>

<template>
  <div>
    <!-- Loading grid -->
    <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <ArticleCardSkeleton v-for="i in skeletons" :key="i" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="articles.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm dark:bg-gray-800"
    >
      <svg class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <p class="text-sm text-gray-400 dark:text-gray-500">{{ t.noArticles }}</p>
    </div>

    <!-- Article cards -->
    <div v-else>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          :disabled="page <= 1"
          class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          @click="emit('page-change', page - 1)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ t.prev }}
        </button>

        <!-- Page numbers -->
        <div class="flex items-center gap-1">
          <template v-for="p in totalPages" :key="p">
            <!-- Show first, last, current ±1, and ellipsis -->
            <template v-if="p === 1 || p === totalPages || Math.abs(p - page) <= 1">
              <button
                type="button"
                :class="[
                  'min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-brand-600 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
                ]"
                @click="emit('page-change', p)"
              >{{ p }}</button>
            </template>
            <span
              v-else-if="p === 2 && page > 3"
              class="px-1 text-gray-400 dark:text-gray-600"
            >…</span>
            <span
              v-else-if="p === totalPages - 1 && page < totalPages - 2"
              class="px-1 text-gray-400 dark:text-gray-600"
            >…</span>
          </template>
        </div>

        <button
          type="button"
          :disabled="page >= totalPages"
          class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          @click="emit('page-change', page + 1)"
        >
          {{ t.next }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- Page counter -->
      <p v-if="totalPages > 1" class="mt-3 text-center text-xs text-gray-400 dark:text-gray-600">
        {{ t.page }} {{ page }} {{ t.of }} {{ totalPages }}
      </p>
    </div>
  </div>
</template>
