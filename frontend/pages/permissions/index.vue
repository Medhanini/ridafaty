<script setup lang="ts">
import { usePermissionsStore } from '~/stores/permissions'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Permissions — Ridafaty' })

const store = usePermissionsStore()

await store.fetchAll()

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
        <h1 class="text-2xl font-bold text-gray-900">Permissions</h1>
        <p class="mt-1 text-sm text-gray-500">{{ store.permissions.length }} permissions defined</p>
      </div>
      <NuxtLink
        to="/permissions/create"
        class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Permission
      </NuxtLink>
    </div>

    <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

    <!-- Grouped view -->
    <div v-if="store.loading" class="flex items-center justify-center py-16">
      <svg class="h-6 w-6 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
      </svg>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(perms, resource) in store.grouped"
        :key="resource"
        class="overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-3">
          <h2 class="text-sm font-semibold capitalize text-gray-700">{{ resource }}</h2>
          <span class="text-xs text-gray-400">{{ perms.length }} permissions</span>
        </div>
        <table class="min-w-full divide-y divide-gray-100">
          <tbody class="divide-y divide-gray-100">
            <tr v-for="perm in perms" :key="perm.id" class="hover:bg-gray-50">
              <td class="w-16 px-6 py-3 text-sm text-gray-400">#{{ perm.id }}</td>
              <td class="px-6 py-3">
                <code class="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700">{{ perm.name }}</code>
              </td>
              <td class="px-6 py-3 text-sm text-gray-500">{{ perm.description ?? '—' }}</td>
              <td class="px-6 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/permissions/${perm.id}/edit`"
                    class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    type="button"
                    class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    @click="deleteTarget = perm.id"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="store.permissions.length === 0" class="rounded-2xl bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
        No permissions defined yet.
      </div>
    </div>

    <AppModal
      :show="!!deleteTarget"
      title="Delete Permission"
      message="Deleting this permission will remove it from all roles. This action cannot be undone."
      confirm-label="Delete"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
