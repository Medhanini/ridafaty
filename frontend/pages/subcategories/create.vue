<script setup lang="ts">
import { useSubCategoriesStore } from '~/stores/subcategories'
import { useCategoriesStore } from '~/stores/categories'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Create Sub-Category — Ridafaty' })

const store = useSubCategoriesStore()
const categoriesStore = useCategoriesStore()

await categoriesStore.fetchAll({ limit: 100 })

const form = reactive({
  name: '',
  lang: 'fr' as 'fr' | 'en' | 'ar',
  categoryId: undefined as number | undefined,
})

async function submit() {
  try {
    await store.create(form)
    await navigateTo('/subcategories')
  } catch {
    // error set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/subcategories" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Create Sub-Category</h1>
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm">
      <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

      <form class="space-y-5" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Sub-category name"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

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
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="category">Category</label>
          <select
            id="category"
            v-model="form.categoryId"
            required
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option :value="undefined">— Select category —</option>
            <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }} ({{ cat.lang }})
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <NuxtLink to="/subcategories" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</NuxtLink>
          <button
            type="submit"
            :disabled="store.loading"
            class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="store.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Create Sub-Category
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
