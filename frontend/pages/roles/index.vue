<script setup lang="ts">
import { useRolesStore } from '~/stores/roles'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Roles — Ridafaty' })

const store = useRolesStore()

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
        <h1 class="text-2xl font-bold text-gray-900">Roles</h1>
        <p class="mt-1 text-sm text-gray-500">{{ store.roles.length }} roles configured</p>
      </div>
      <NuxtLink
        to="/roles/create"
        class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Role
      </NuxtLink>
    </div>

    <AppAlert v-if="store.error" type="error" :message="store.error" dismissible class="mb-5" @dismiss="store.clearError()" />

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
            <th class="px-6 py-3">Permissions</th>
            <th class="px-6 py-3">Created</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="store.roles.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-400">No roles found.</td>
          </tr>
          <tr v-for="role in store.roles" :key="role.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-500">#{{ role.id }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ role.name }}</td>
            <td class="px-6 py-4">
              <span class="text-sm text-gray-500">{{ role.permissions?.length ?? 0 }} permissions</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ new Date(role.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/roles/${role.id}/edit`"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </NuxtLink>
                <button
                  type="button"
                  class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  @click="deleteTarget = role.id"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal
      :show="!!deleteTarget"
      title="Delete Role"
      message="Are you sure you want to delete this role? Users assigned to it will lose their role."
      confirm-label="Delete"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
