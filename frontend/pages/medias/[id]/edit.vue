<script setup lang="ts">
import { useMediasStore } from '~/stores/medias'
import { getVideoEmbed } from '~/composables/useVideoEmbed'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Edit Media — Ridafaty' })

const route = useRoute()
const store = useMediasStore()
const id    = Number(route.params.id)

await store.fetchById(id)

const media = store.currentMedia!

// ── Image re-upload state (only for type === 'image') ─────────────────────────

const imageFile    = ref<File | null>(null)
const imagePreview = ref<string>('')
const imageAlt     = ref(media.alt ?? '')
const imageError   = ref('')

const ALLOWED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE_MB    = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return

  if (!ALLOWED_TYPES.includes(file.type)) {
    imageError.value = 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG'
    imageFile.value  = null
    imagePreview.value = ''
    return
  }
  if (file.size > MAX_SIZE_BYTES) {
    imageError.value = `File too large. Maximum size: ${MAX_SIZE_MB} MB`
    imageFile.value  = null
    imagePreview.value = ''
    return
  }

  imageError.value   = ''
  imageFile.value    = file
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = URL.createObjectURL(file)
}

function clearNewImage() {
  imageFile.value = null
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = ''
  imageError.value   = ''
}

async function submitImage() {
  try {
    if (imageFile.value) {
      // New file selected → re-upload (replaces old file + updates URL)
      await store.reuploadImage(id, imageFile.value, imageAlt.value || undefined)
    } else {
      // Only alt text changed
      await store.update(id, { alt: imageAlt.value || null })
    }
    await navigateTo('/medias')
  } catch {
    // error set in store
  }
}

// ── Video URL state (only for type === 'video') ───────────────────────────────

const videoUrl = ref(media.url)
const videoAlt = ref(media.alt ?? '')

const videoEmbed = computed(() => getVideoEmbed(videoUrl.value))

async function submitVideo() {
  try {
    await store.update(id, {
      url: videoUrl.value,
      alt: videoAlt.value || null,
    })
    await navigateTo('/medias')
  } catch {
    // error set in store
  }
}

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})
</script>

<template>
  <div class="mx-auto max-w-lg">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/medias" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Edit Media</h1>
        <span
          :class="['mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
            media.type === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700']"
        >{{ media.type }}</span>
      </div>
    </div>

    <!-- Store error -->
    <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

    <!-- ── IMAGE EDIT ───────────────────────────────────────────────────────── -->
    <div v-if="media.type === 'image'" class="rounded-2xl bg-white p-6 shadow-sm">
      <form class="space-y-5" @submit.prevent="submitImage">

        <!-- Current image -->
        <div>
          <p class="mb-1.5 text-sm font-medium text-gray-700">Current image</p>
          <div class="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img
              :src="media.url"
              :alt="media.alt || ''"
              class="max-h-48 w-full object-contain"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
        </div>

        <!-- Replace image (optional) -->
        <div>
          <p class="mb-1.5 text-sm font-medium text-gray-700">
            Replace image
            <span class="ml-1 font-normal text-gray-400">(optional — leave blank to keep current)</span>
          </p>

          <!-- New file preview -->
          <div v-if="imagePreview" class="mb-3 overflow-hidden rounded-xl border border-brand-200 bg-gray-50">
            <img :src="imagePreview" alt="New preview" class="max-h-48 w-full object-contain" />
            <div class="flex items-center justify-between border-t border-gray-100 px-3 py-2">
              <span class="truncate text-xs text-gray-500">{{ imageFile?.name }}</span>
              <button type="button" class="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700" @click="clearNewImage">Remove</button>
            </div>
          </div>

          <!-- Upload zone -->
          <label
            v-else
            class="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <svg class="h-7 w-7 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Click to choose a new file</p>
              <p class="text-xs text-gray-400">JPEG, PNG, GIF, WebP, SVG · max {{ MAX_SIZE_MB }} MB</p>
            </div>
            <input type="file" accept="image/*" class="sr-only" @change="onFileChange" />
          </label>

          <p v-if="imageError" class="mt-1.5 text-xs text-red-600">{{ imageError }}</p>
        </div>

        <!-- Alt text -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="img-alt">
            Alt text <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="img-alt"
            v-model="imageAlt"
            type="text"
            placeholder="Descriptive alt text"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <NuxtLink to="/medias" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</NuxtLink>
          <button
            type="submit"
            :disabled="store.loading"
            class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="store.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>

    <!-- ── VIDEO EDIT ───────────────────────────────────────────────────────── -->
    <div v-else class="rounded-2xl bg-white p-6 shadow-sm">
      <form class="space-y-5" @submit.prevent="submitVideo">

        <!-- URL input -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="vid-url">Video URL</label>
          <input
            id="vid-url"
            v-model="videoUrl"
            type="url"
            required
            placeholder="https://youtube.com/watch?v=…"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- Live preview -->
        <div v-if="videoEmbed && videoUrl">
          <div v-if="videoEmbed.type === 'youtube' || videoEmbed.type === 'vimeo'"
               class="overflow-hidden rounded-xl border border-gray-200 bg-black">
            <div class="relative w-full" style="padding-top: 56.25%">
              <iframe
                :src="videoEmbed.src"
                class="absolute inset-0 h-full w-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <div v-else-if="videoEmbed.type === 'direct'"
               class="overflow-hidden rounded-xl border border-gray-200 bg-black">
            <video :src="videoEmbed.src" controls class="max-h-56 w-full"
                   @error="($event.target as HTMLVideoElement).style.display = 'none'" />
          </div>
          <div v-else class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Preview not available for this URL format.
          </div>
        </div>

        <!-- Alt text -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="vid-alt">
            Alt text <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="vid-alt"
            v-model="videoAlt"
            type="text"
            placeholder="Descriptive label for this video"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <NuxtLink to="/medias" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</NuxtLink>
          <button
            type="submit"
            :disabled="store.loading"
            class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="store.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
