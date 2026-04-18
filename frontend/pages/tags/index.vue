<script setup lang="ts">
import { useTagsStore } from '~/stores/tags'
import { usePermission } from '~/composables/usePermission'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Tags — Idafaty' })

const store = useTagsStore()
const { can } = usePermission()

const page = ref(1)
const limit = 20
const langFilter = ref('')

await store.fetchAll({ page: page.value, limit })

async function applyFilter() {
  page.value = 1
  await store.fetchAll({ lang: langFilter.value || undefined, page: 1, limit })
}

async function changePage(p: number) {
  page.value = p
  await store.fetchAll({ lang: langFilter.value || undefined, page: p, limit })
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
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tags</h1>
        <p class="mt-1 text-sm text-gray-500">{{ store.total }} total</p>
      </div>
      <NuxtLink
        v-if="can('tags:create')"
        to="/tags/create"
        class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Tag
      </NuxtLink>
    </div>

    <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

    <!-- Filters -->
    <div class="mb-4">
      <select
        v-model="langFilter"
        class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        @change="applyFilter"
      >
        <option value="">All languages</option>
        <option value="fr">French</option>
        <option value="en">English</option>
        <option value="ar">Arabic</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div v-if="store.loading" class="flex items-center justify-center py-16">
        <svg class="h-6 w-6 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
        </svg>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th class="px-6 py-3">ID</th>
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Slug</th>
            <th class="px-6 py-3">Lang</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="store.tags.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-400">No tags found.</td>
          </tr>
          <tr v-for="tag in store.tags" :key="tag.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-500">#{{ tag.id }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">
              <span class="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700"># {{ tag.name }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 font-mono">{{ tag.slug }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 uppercase">{{ tag.lang }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  v-if="can('tags:update')"
                  :to="`/tags/${tag.id}/edit`"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >Edit</NuxtLink>
                <button
                  v-if="can('tags:delete')"
                  type="button"
                  class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  @click="deleteTarget = tag.id"
                >Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-100 px-6 py-4">
        <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button type="button" :disabled="page <= 1" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40" @click="changePage(page - 1)">Prev</button>
          <button type="button" :disabled="page >= totalPages" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40" @click="changePage(page + 1)">Next</button>
        </div>
      </div>
    </div>

    <AppModal
      :show="!!deleteTarget"
      title="Delete Tag"
      message="Are you sure you want to delete this tag?"
      confirm-label="Delete"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
