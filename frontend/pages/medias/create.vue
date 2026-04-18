<script setup lang="ts">
import { useMediasStore } from '~/stores/medias'
import { getVideoEmbed } from '~/composables/useVideoEmbed'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Add Media — Ridafaty' })

const store = useMediasStore()

// ── Tab ───────────────────────────────────────────────────────────────────────

const tab = ref<'image' | 'video'>('image')

// ── Image upload state ────────────────────────────────────────────────────────

const imageFile    = ref<File | null>(null)
const imagePreview = ref<string>('')
const imageAlt     = ref('')
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

function clearImage() {
  imageFile.value = null
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = ''
  imageError.value   = ''
}

async function submitImage() {
  if (!imageFile.value) {
    imageError.value = 'Please select an image file.'
    return
  }
  try {
    await store.uploadImage(imageFile.value, imageAlt.value || undefined)
    await navigateTo('/medias')
  } catch {
    // error set in store
  }
}

// ── Video URL state ───────────────────────────────────────────────────────────

const videoUrl = ref('')
const videoAlt = ref('')

const videoEmbed = computed(() => getVideoEmbed(videoUrl.value))

async function submitVideo() {
  try {
    await store.create({ url: videoUrl.value, type: 'video', alt: videoAlt.value || undefined })
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
      <h1 class="text-2xl font-bold text-gray-900">Add Media</h1>
    </div>

    <!-- Store error -->
    <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

    <!-- Tab switcher -->
    <div class="mb-5 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
      <button
        type="button"
        :class="['flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
          tab === 'image' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
        @click="tab = 'image'"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        Upload Image
      </button>
      <button
        type="button"
        :class="['flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
          tab === 'video' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
        @click="tab = 'video'"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Video URL
      </button>
    </div>

    <!-- ── IMAGE TAB ─────────────────────────────────────────────────────────── -->
    <div v-if="tab === 'image'" class="rounded-2xl bg-white p-6 shadow-sm">
      <form class="space-y-5" @submit.prevent="submitImage">

        <!-- Drop zone / file input -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Image file</label>

          <!-- Preview shown once a file is selected -->
          <div v-if="imagePreview" class="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img :src="imagePreview" alt="Preview" class="max-h-64 w-full object-contain" />
            <div class="flex items-center justify-between border-t border-gray-100 px-3 py-2">
              <span class="truncate text-xs text-gray-500">{{ imageFile?.name }}</span>
              <button type="button" class="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700" @click="clearImage">Remove</button>
            </div>
          </div>

          <!-- Upload drop zone -->
          <label
            v-else
            class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <svg class="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p class="mt-0.5 text-xs text-gray-400">JPEG, PNG, GIF, WebP, SVG · max {{ MAX_SIZE_MB }} MB</p>
            </div>
            <input type="file" accept="image/*" class="sr-only" @change="onFileChange" />
          </label>

          <!-- Client-side validation error -->
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
            placeholder="Descriptive alt text for accessibility"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <NuxtLink to="/medias" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</NuxtLink>
          <button
            type="submit"
            :disabled="store.loading || !imageFile"
            class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="store.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Upload Image
          </button>
        </div>
      </form>
    </div>

    <!-- ── VIDEO TAB ─────────────────────────────────────────────────────────── -->
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
            autofocus
            placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <p class="mt-1 text-xs text-gray-400">YouTube, Vimeo, or a direct .mp4 / .webm link</p>
        </div>

        <!-- Live preview -->
        <div v-if="videoEmbed && videoUrl">
          <!-- YouTube / Vimeo iframe -->
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
          <!-- Direct video file -->
          <div v-else-if="videoEmbed.type === 'direct'"
               class="overflow-hidden rounded-xl border border-gray-200 bg-black">
            <video :src="videoEmbed.src" controls class="max-h-56 w-full"
                   @error="($event.target as HTMLVideoElement).style.display = 'none'" />
          </div>
          <!-- Unknown URL – show info badge only -->
          <div v-else class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Preview not available for this URL format. It will be saved as-is.
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
            Save Video
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
