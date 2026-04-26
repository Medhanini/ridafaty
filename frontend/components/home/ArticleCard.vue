<script setup lang="ts">
import type { Article } from '~/types'

const props = defineProps<{
  article: Article
  size?: 'sm' | 'md' | 'lg'
}>()

const { t, lang, formatDate, isRTL } = useLang()

const size = computed(() => props.size ?? 'md')

const NuxtLinkComp = resolveComponent('NuxtLink')

const coverImage = computed(() =>
  props.article.media?.find((m) => m.media.type === 'image')?.media ?? null,
)

const categoryName = computed(
  () => props.article.subCategory?.category?.name ?? props.article.subCategory?.name ?? null,
)
const categorySlug    = computed(() => props.article.subCategory?.category?.slug ?? null)
const subcategorySlug = computed(() => props.article.subCategory?.slug ?? null)

const articleUrl = computed(() => {
  const cat = categorySlug.value
  const sub = subcategorySlug.value
  if (cat && sub) return `/${lang.value}/${cat}/${sub}/${props.article.slug}`
  return null
})
</script>

<template>
  <component
    :is="articleUrl ? NuxtLinkComp : 'article'"
    v-bind="articleUrl ? { to: articleUrl } : {}"
    :class="[
      'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800',
      size === 'lg' ? 'md:flex-row' : '',
      articleUrl ? 'cursor-pointer' : '',
    ]"
  >
    <!-- Cover image -->
    <div
      :class="[
        'shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700',
        size === 'lg' ? 'md:w-1/2' : '',
        'aspect-[16/9]',
      ]"
    >
      <img
        v-if="coverImage"
        :src="coverImage.url"
        :alt="coverImage.alt || article.title"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <svg class="h-10 w-10 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4" :class="size === 'lg' ? 'justify-center md:p-8' : ''">

      <!-- Category badge -->
      <div v-if="categoryName" class="mb-2">
        <span class="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          {{ categoryName }}
        </span>
      </div>

      <!-- Title -->
      <h2
        :class="[
          'font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400',
          size === 'lg' ? 'text-2xl sm:text-3xl' : size === 'sm' ? 'text-sm' : 'text-base',
        ]"
      >{{ article.title }}</h2>

      <!-- Excerpt -->
      <p
        v-if="article.excerpt && size !== 'sm'"
        class="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
        :class="size === 'lg' ? 'line-clamp-4 text-base' : ''"
      >{{ article.excerpt }}</p>

      <!-- Meta: author + date -->
      <div
        class="mt-4 flex items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-500"
        :class="isRTL ? 'flex-row-reverse' : ''"
      >
        <span v-if="article.user" class="truncate font-medium text-gray-500 dark:text-gray-400">
          {{ article.user.name }}
        </span>
        <time :datetime="article.createdAt" class="shrink-0">
          {{ formatDate(article.createdAt) }}
        </time>
      </div>

      <!-- Read more (lg only) -->
      <div v-if="size === 'lg'" class="mt-5">
        <span
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400"
          :class="isRTL ? 'flex-row-reverse' : ''"
        >
          {{ t.readMore }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline :points="isRTL ? '12 5 5 12 12 19' : '12 5 19 12 12 19'"/>
          </svg>
        </span>
      </div>
    </div>
  </component>
</template>
