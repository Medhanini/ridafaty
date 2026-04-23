<script setup lang="ts">
import { useArticlesStore } from '~/stores/articles'
import { useSubCategoriesStore } from '~/stores/subcategories'
import { useTagsStore } from '~/stores/tags'
import { useMediasStore } from '~/stores/medias'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Edit Article — Idafaty' })

const route = useRoute()
const articlesStore = useArticlesStore()
const subCatStore = useSubCategoriesStore()
const tagsStore = useTagsStore()
const mediasStore = useMediasStore()

const id = Number(route.params.id)

// Fetch article first so we know its language before fetching lang-filtered resources
await articlesStore.fetchById(id)
const article = articlesStore.currentArticle!

const form = reactive({
  title: article.title,
  content: article.content,
  excerpt: article.excerpt ?? '',
  lang: article.lang as 'fr' | 'en' | 'ar',
  subCategoryId: article.subCategoryId as number | undefined,
  tagIds: article.tags?.map((at) => at.tagId) ?? [],
  mediaIds: article.media?.map((am) => am.mediaId) ?? [],
})

await Promise.all([
  subCatStore.fetchAll({ limit: 100, lang: form.lang }),
  tagsStore.fetchAll({ limit: 100, lang: form.lang }),
  mediasStore.fetchAll({ limit: 100 }),
])

watch(() => form.lang, async (lang) => {
  form.tagIds = []
  form.subCategoryId = undefined
  await Promise.all([
    subCatStore.fetchAll({ limit: 100, lang }),
    tagsStore.fetchAll({ limit: 100, lang }),
  ])
})

function toggleTag(id: number) {
  const idx = form.tagIds.indexOf(id)
  if (idx === -1) form.tagIds.push(id)
  else form.tagIds.splice(idx, 1)
}

function toggleMedia(id: number) {
  const idx = form.mediaIds.indexOf(id)
  if (idx === -1) form.mediaIds.push(id)
  else form.mediaIds.splice(idx, 1)
}

async function submit() {
  try {
    await articlesStore.update(id, form)
    await navigateTo('/articles')
  } catch {
    // error set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/articles" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Edit Article</h1>
    </div>

    <AppAlert v-if="articlesStore.error" type="error" :message="articlesStore.error" dismissible class="mb-5" @dismiss="articlesStore.clearError()" />

    <form class="space-y-6" @submit.prevent="submit">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Main content column -->
        <div class="space-y-5 lg:col-span-2">
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <div class="space-y-5">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700" for="title">Title</label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  placeholder="Article title"
                  class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Content</label>
                <ClientOnly>
                  <RichEditor v-model="form.content" />
                  <template #fallback>
                    <div class="h-48 animate-pulse rounded-lg bg-gray-100" />
                  </template>
                </ClientOnly>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700" for="excerpt">Excerpt <span class="font-normal text-gray-400">(optional)</span></label>
                <textarea
                  id="excerpt"
                  v-model="form.excerpt"
                  rows="3"
                  placeholder="Short description..."
                  class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-gray-900">Tags</h3>
            <div v-if="tagsStore.tags.length === 0" class="text-sm text-gray-400">No tags available.</div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="tag in tagsStore.tags"
                :key="tag.id"
                type="button"
                :class="[
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  form.tagIds.includes(tag.id)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ]"
                @click="toggleTag(tag.id)"
              ># {{ tag.name }}</button>
            </div>
          </div>

          <!-- Media -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-gray-900">Media</h3>
            <div v-if="mediasStore.medias.length === 0" class="text-sm text-gray-400">No media available.</div>
            <div v-else class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              <button
                v-for="media in mediasStore.medias"
                :key="media.id"
                type="button"
                :class="[
                  'group relative overflow-hidden rounded-lg border-2 transition-colors',
                  form.mediaIds.includes(media.id) ? 'border-brand-500' : 'border-transparent hover:border-gray-300',
                ]"
                @click="toggleMedia(media.id)"
              >
                <div class="aspect-square bg-gray-100">
                  <img
                    v-if="media.type === 'image'"
                    :src="media.url"
                    :alt="media.alt || ''"
                    class="h-full w-full object-cover"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <div v-else class="flex h-full items-center justify-center">
                    <svg class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
                <div
                  v-if="form.mediaIds.includes(media.id)"
                  class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white"
                >
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar column -->
        <div class="space-y-5">
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700" for="lang">Language</label>
                <select
                  id="lang"
                  v-model="form.lang"
                  class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="fr">French</option>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700" for="subcategory">Sub-Category</label>
                <select
                  id="subcategory"
                  v-model="form.subCategoryId"
                  class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option :value="undefined">— Select —</option>
                  <option v-for="sub in subCatStore.subcategories" :key="sub.id" :value="sub.id">
                    {{ sub.name }} ({{ sub.lang }})
                  </option>
                </select>
              </div>

            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button
              type="submit"
              :disabled="articlesStore.loading"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              <svg v-if="articlesStore.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
              Save Changes
            </button>
            <NuxtLink to="/articles" class="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</NuxtLink>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
