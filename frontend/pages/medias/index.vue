<script setup lang="ts">
import { useMediasStore } from '~/stores/medias'
import { usePermission } from '~/composables/usePermission'
import { getVideoEmbed } from '~/composables/useVideoEmbed'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Media — Idafaty' })

const store = useMediasStore()
const { can } = usePermission()

const page = ref(1)
const limit = 20
const typeFilter = ref('')

await store.fetchAll({ page: page.value, limit })

async function applyFilter() {
  page.value = 1
  await store.fetchAll({ type: typeFilter.value || undefined, page: 1, limit })
}

async function changePage(p: number) {
  page.value = p
  await store.fetchAll({ type: typeFilter.value || undefined, page: p, limit })
}

const totalPages = computed(() => Math.ceil(store.total / limit))

const deleteTarget = ref<number | null>(null)
const deleteLoading = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await store.remove(deleteTarget.value)
    deleteTarget.value = null
  } finally {
    deleteLoading.value = false
  }
}

function getYoutubeThumbnail(url: string): string | null {
  const embed = getVideoEmbed(url)
  return embed?.type === 'youtube' ? embed.thumbnail ?? null : null
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Media</h1>
        <p class="mt-1 text-sm text-gray-500">{{ store.total }} total</p>
      </div>
      <NuxtLink
        v-if="can('media:create')"
        to="/medias/create"
        class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Media
      </NuxtLink>
    </div>

    <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

    <!-- Filters -->
    <div class="mb-4">
      <select
        v-model="typeFilter"
        class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        @change="applyFilter"
      >
        <option value="">All types</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
      </select>
    </div>

    <div v-if="store.loading" class="flex items-center justify-center py-16">
      <svg class="h-6 w-6 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
      </svg>
    </div>

    <!-- Grid view -->
    <div v-else>
      <div v-if="store.medias.length === 0" class="rounded-2xl bg-white py-12 text-center shadow-sm">
        <p class="text-sm text-gray-400">No media found.</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div
          v-for="media in store.medias"
          :key="media.id"
          class="group relative overflow-hidden rounded-xl bg-white shadow-sm"
        >
          <!-- Preview -->
          <div class="aspect-square overflow-hidden bg-gray-100">
            <!-- Uploaded image -->
            <img
              v-if="media.type === 'image'"
              :src="media.url"
              :alt="media.alt || ''"
              class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <!-- Video: YouTube thumbnail if available, otherwise play icon -->
            <template v-else-if="media.type === 'video'">
              <div class="relative h-full w-full">
                <img
                  v-if="getYoutubeThumbnail(media.url)"
                  :src="getYoutubeThumbnail(media.url)!"
                  :alt="media.alt || 'Video thumbnail'"
                  class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div v-else class="flex h-full items-center justify-center bg-gray-900">
                  <svg class="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <!-- Play overlay badge -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="rounded-full bg-black/50 p-2">
                    <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Info -->
          <div class="p-3">
            <p class="truncate text-xs font-medium text-gray-900">{{ media.alt || media.url.split('/').pop() }}</p>
            <p class="mt-0.5 text-xs text-gray-400 uppercase">{{ media.type }}</p>
          </div>

          <!-- Actions overlay -->
          <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <NuxtLink
              v-if="can('media:update')"
              :to="`/medias/${media.id}/edit`"
              class="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100"
            >Edit</NuxtLink>
            <button
              v-if="can('media:delete')"
              type="button"
              class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              @click="deleteTarget = media.id"
            >Delete</button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
        <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button type="button" :disabled="page <= 1" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40" @click="changePage(page - 1)">Prev</button>
          <button type="button" :disabled="page >= totalPages" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40" @click="changePage(page + 1)">Next</button>
        </div>
      </div>
    </div>

    <AppModal
      :show="!!deleteTarget"
      title="Delete Media"
      message="Are you sure you want to delete this media item?"
      confirm-label="Delete"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
