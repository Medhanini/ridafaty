<script setup lang="ts">
import type { Article, ArticleMedia, ArticleTag } from '~/types'

definePageMeta({
  layout: 'default',
  validate: (route) => ['fr', 'en', 'ar'].includes(route.params.lang as string),
})

const route                          = useRoute()
const { t, lang, formatDate, isRTL } = useLang()
const { publicFetch }                = usePublicFetch()

const categorySlug    = route.params.category    as string
const subcategorySlug = route.params.subcategory as string
const articleSlug     = route.params.slug        as string

const { data: articleData, pending, error } = await useAsyncData(
  `article-${articleSlug}`,
  () => publicFetch<{ success: boolean; data: Article }>(`/articles/slug/${articleSlug}`),
  { watch: [lang] },
)

const article = computed(() => articleData.value?.data ?? null)

watchEffect(() => {
  if (!pending.value && !article.value) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
  }
})

const coverImage  = computed(() =>
  article.value?.media?.find((m: ArticleMedia) => m.media.type === 'image') ?? null
)
const coverUrl    = computed(() => coverImage.value?.media.url ?? null)
const coverAlt    = computed(() => coverImage.value?.media.alt ?? article.value?.title ?? '')

const extraImages = computed(() =>
  (article.value?.media ?? [])
    .filter((m: ArticleMedia) => m.media.type === 'image')
    .slice(1)
    .map((m: ArticleMedia) => m.media),
)

const tags        = computed(() =>
  (article.value?.tags ?? []).map((at: ArticleTag) => at.tag),
)

const category    = computed(() => article.value?.subCategory?.category)
const subcategory = computed(() => article.value?.subCategory)

const readingTime = computed(() => {
  const text  = (article.value?.content ?? '').replace(/<[^>]+>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
})

useSeoMeta({
  title:                computed(() => article.value?.title ?? ''),
  description:          computed(() => article.value?.excerpt ?? article.value?.title ?? ''),
  ogTitle:              computed(() => article.value?.title ?? ''),
  ogDescription:        computed(() => article.value?.excerpt ?? article.value?.title ?? ''),
  ogType:               'article',
  ogImage:              computed(() => coverUrl.value ?? undefined),
  articleAuthor:        computed(() => article.value?.user?.name),
  articlePublishedTime: computed(() => article.value?.createdAt),
  articleModifiedTime:  computed(() => article.value?.updatedAt),
})

const breadcrumb = computed(() => [
  { label: t.value.home,                   to: `/${lang.value}/` },
  { label: category.value?.name    ?? '',  to: `/${lang.value}/${categorySlug}` },
  { label: subcategory.value?.name ?? '',  to: `/${lang.value}/${categorySlug}/${subcategorySlug}` },
  { label: article.value?.title    ?? '' },
])

type RelatedList = { data: Article[]; total: number }

const { data: relatedData } = await useAsyncData<RelatedList | null>(
  `related-${articleSlug}`,
  () => {
    const id = article.value?.subCategoryId
    if (!id) return Promise.resolve(null)
    return publicFetch<RelatedList>(`/articles?subCategoryId=${id}&limit=4&page=1&lang=${lang.value}`)
  },
)
const relatedArticles = computed<Article[]>(() =>
  (relatedData.value?.data ?? []).filter((a) => a.id !== article.value?.id).slice(0, 3),
)
</script>

<template>
  <div>

    <template v-if="pending">
      <div class="h-64 w-full animate-pulse bg-gray-200 dark:bg-gray-800 sm:h-80 lg:h-[28rem]" />
      <div class="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <div class="mb-6 flex gap-2">
          <div class="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div class="h-4 w-3 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="mb-3 h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div class="mb-4 h-10 w-4/5 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div class="mb-2 h-10 w-3/5 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div class="my-6 flex gap-4">
          <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div class="h-4 w-32 self-center rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="space-y-3 pt-4">
          <div v-for="i in 6" :key="i" :class="['h-4 rounded bg-gray-100 dark:bg-gray-800', i % 3 === 0 ? 'w-4/5' : 'w-full']" />
        </div>
      </div>
    </template>

    <template v-else-if="error || !article">
      <div class="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <svg class="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h1 class="mb-2 text-xl font-bold text-gray-800 dark:text-white">{{ t.notFound }}</h1>
        <NuxtLink :to="`/${lang}/`" class="mt-4 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {{ t.backToHome }}
        </NuxtLink>
      </div>
    </template>

    <template v-else>

      <!-- Hero -->
      <div
        :class="[
          'relative w-full overflow-hidden',
          coverUrl ? 'h-64 bg-gray-900 sm:h-80 lg:h-[32rem]' : 'bg-gradient-to-br from-brand-700 to-brand-900 py-16',
        ]"
      >
        <img
          v-if="coverUrl"
          :src="coverUrl"
          :alt="coverAlt"
          class="h-full w-full object-cover opacity-75"
          loading="eager"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

        <div class="absolute inset-x-0 top-0 px-4 pt-5 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-4xl">
            <Breadcrumb
              :items="breadcrumb"
              class="[&_a]:text-gray-300 [&_a:hover]:text-white [&_svg]:text-gray-500 [&_span:last-child]:text-white/80"
            />
          </div>
        </div>

        <div
          class="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 lg:px-8"
          :class="isRTL ? 'text-right' : ''"
        >
          <div class="mx-auto max-w-4xl">
            <div class="mb-3 flex flex-wrap items-center gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
              <NuxtLink
                v-if="category"
                :to="`/${lang}/${categorySlug}`"
                class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
              >{{ category.name }}</NuxtLink>
              <span class="text-white/40">·</span>
              <NuxtLink
                v-if="subcategory"
                :to="`/${lang}/${categorySlug}/${subcategorySlug}`"
                class="rounded-full bg-brand-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-brand-500"
              >{{ subcategory.name }}</NuxtLink>
            </div>
            <h1 class="text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
              {{ article.title }}
            </h1>
          </div>
        </div>
      </div>

      <!-- Meta bar -->
      <div class="sticky top-[57px] z-30 border-b border-gray-100 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
        <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 text-sm"
            :class="isRTL ? 'flex-row-reverse' : ''"
          >
            <span v-if="article.user" class="flex items-center gap-2">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                {{ article.user.name.charAt(0).toUpperCase() }}
              </span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">{{ article.user.name }}</span>
            </span>
            <span class="hidden h-4 w-px bg-gray-200 dark:bg-gray-700 sm:block" />
            <span class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
            </span>
            <span class="hidden h-4 w-px bg-gray-200 dark:bg-gray-700 sm:block" />
            <span class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ readingTime }} min
            </span>
            <span class="ms-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {{ article.lang }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        <p
          v-if="article.excerpt"
          class="mt-8 border-l-4 border-brand-400 py-1 pl-4 text-lg font-medium leading-relaxed text-gray-600 dark:border-brand-600 dark:text-gray-300"
          :class="isRTL ? 'border-l-0 border-r-4 pr-4 pl-0 text-right' : ''"
        >{{ article.excerpt }}</p>

        <div
          class="article-content mt-8"
          :dir="isRTL ? 'rtl' : 'ltr'"
          v-html="article.content"
        />

        <div v-if="extraImages.length > 0" class="mt-12">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Photos</h2>
          <div
            :class="[
              'grid gap-3',
              extraImages.length === 1 ? 'grid-cols-1' :
              extraImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
            ]"
          >
            <div
              v-for="img in extraImages"
              :key="img.id"
              class="group overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800"
            >
              <img
                :src="img.url"
                :alt="img.alt ?? ''"
                class="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div v-if="tags.length > 0" class="mt-10 border-t border-gray-100 pt-6 dark:border-gray-800">
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ t.tags }}</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in tags"
              :key="tag.id"
              class="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1 text-sm font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400"
            >#&nbsp;{{ tag.name }}</span>
          </div>
        </div>

        <div
          v-if="article.user"
          class="mt-10 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/50"
          :class="isRTL ? 'flex-row-reverse' : ''"
        >
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-extrabold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            {{ article.user.name.charAt(0).toUpperCase() }}
          </div>
          <div :class="isRTL ? 'text-right' : ''">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ t.by }}</p>
            <p class="text-base font-bold text-gray-900 dark:text-white">{{ article.user.name }}</p>
          </div>
        </div>

        <div
          class="mt-10 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800"
          :class="isRTL ? 'flex-row-reverse' : ''"
        >
          <NuxtLink
            :to="`/${lang}/${categorySlug}/${subcategorySlug}`"
            class="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            :class="isRTL ? 'flex-row-reverse' : ''"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {{ subcategory?.name }}
          </NuxtLink>

          <NuxtLink
            :to="`/${lang}/${categorySlug}`"
            class="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >{{ category?.name }}</NuxtLink>
        </div>

      </div>

      <!-- Related articles -->
      <div
        v-if="relatedArticles.length > 0"
        class="mt-14 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60"
      >
        <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 class="mb-6 text-xl font-extrabold text-gray-900 dark:text-white">{{ t.relatedArticles }}</h2>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ArticleCard v-for="rel in relatedArticles" :key="rel.id" :article="rel" />
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<style>
.article-content {
  color: theme('colors.gray.700');
  font-size: 1.0625rem;
  line-height: 1.85;
  overflow-wrap: break-word;
}
.dark .article-content { color: theme('colors.gray.300'); }
.article-content > *:first-child { margin-top: 0 !important; }

.article-content h2,
.article-content h3,
.article-content h4 {
  font-weight: 800;
  line-height: 1.3;
  margin-top: 2.25em;
  margin-bottom: 0.6em;
  color: theme('colors.gray.900');
  scroll-margin-top: 6rem;
}
.dark .article-content h2,
.dark .article-content h3,
.dark .article-content h4 { color: theme('colors.white'); }
.article-content h2 { font-size: 1.5rem; }
.article-content h3 { font-size: 1.25rem; }
.article-content h4 { font-size: 1.1rem; }

.article-content p { margin-bottom: 1.4em; }

.article-content a {
  color: theme('colors.brand.600');
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.15s;
}
.article-content a:hover { color: theme('colors.brand.700'); }
.dark .article-content a { color: theme('colors.brand.400'); }
.dark .article-content a:hover { color: theme('colors.brand.300'); }

.article-content ul,
.article-content ol { padding-left: 1.75rem; margin-bottom: 1.25em; }
.article-content ul  { list-style-type: disc; }
.article-content ol  { list-style-type: decimal; }
.article-content li  { margin-bottom: 0.4em; }

.article-content blockquote {
  border-left: 4px solid theme('colors.brand.400');
  margin: 1.75em 0;
  padding: 0.875em 1.5em;
  background: theme('colors.brand.50');
  border-radius: 0 0.875rem 0.875rem 0;
  font-style: italic;
  color: theme('colors.gray.600');
}
.dark .article-content blockquote {
  background: theme('colors.brand.950');
  border-color: theme('colors.brand.600');
  color: theme('colors.gray.400');
}

.article-content pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 0.9em;
  background: theme('colors.gray.950');
  color: theme('colors.gray.100');
  border-radius: 0.875rem;
  padding: 1.25em 1.5em;
  overflow-x: auto;
  margin-bottom: 1.5em;
}
.article-content code:not(pre code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 0.875em;
  background: theme('colors.gray.100');
  color: theme('colors.brand.700');
  padding: 0.15em 0.45em;
  border-radius: 0.3em;
}
.dark .article-content code:not(pre code) {
  background: theme('colors.gray.800');
  color: theme('colors.brand.400');
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.875rem;
  margin: 1.5em auto;
  display: block;
}

.article-content hr {
  border: none;
  border-top: 2px solid theme('colors.gray.100');
  margin: 2.5em 0;
}
.dark .article-content hr { border-color: theme('colors.gray.800'); }

.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5em;
  font-size: 0.925em;
  overflow: hidden;
  border-radius: 0.75rem;
}
.article-content th,
.article-content td {
  border: 1px solid theme('colors.gray.200');
  padding: 0.625em 0.875em;
  text-align: start;
}
.dark .article-content th,
.dark .article-content td { border-color: theme('colors.gray.700'); }
.article-content th {
  background: theme('colors.gray.50');
  font-weight: 700;
  color: theme('colors.gray.900');
}
.dark .article-content th {
  background: theme('colors.gray.800');
  color: theme('colors.white');
}

[dir="rtl"] .article-content blockquote {
  border-left: none;
  border-right: 4px solid theme('colors.brand.400');
  border-radius: 0.875rem 0 0 0.875rem;
}
[dir="rtl"] .article-content ul,
[dir="rtl"] .article-content ol {
  padding-left: 0;
  padding-right: 1.75rem;
}
</style>
