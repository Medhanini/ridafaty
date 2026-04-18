<script setup lang="ts">
import { usePermissionsStore } from '~/stores/permissions'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Create Permission — Idafaty' })

const store = usePermissionsStore()

const form = reactive({
  name: '',
  description: '',
})

async function submit() {
  store.clearError()
  try {
    await store.create({ name: form.name, description: form.description || undefined })
    await navigateTo('/permissions')
  } catch {
    // error set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/permissions" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Create Permission</h1>
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm">
      <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

      <form class="space-y-5" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="name">
            Permission Name
            <span class="ml-1 font-normal text-gray-400">(resource:action format)</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. posts:create"
            pattern="[a-z_-]+:[a-z_-]+"
            title="Must follow resource:action format (e.g. posts:create)"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="description">
            Description
            <span class="ml-1 font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="description"
            v-model="form.description"
            type="text"
            placeholder="What does this permission allow?"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <NuxtLink
            to="/permissions"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="store.loading"
            class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="store.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Create Permission
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
