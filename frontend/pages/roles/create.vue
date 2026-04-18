<script setup lang="ts">
import { useRolesStore } from '~/stores/roles'
import { usePermissionsStore } from '~/stores/permissions'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Create Role — Ridafaty' })

const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()

await permissionsStore.fetchAll()

const form = reactive({ name: '' })
const selectedPermissions = ref<number[]>([])

function togglePermission(id: number) {
  const idx = selectedPermissions.value.indexOf(id)
  if (idx === -1) selectedPermissions.value.push(id)
  else selectedPermissions.value.splice(idx, 1)
}

function toggleGroup(ids: number[]) {
  const allSelected = ids.every((id) => selectedPermissions.value.includes(id))
  if (allSelected) {
    selectedPermissions.value = selectedPermissions.value.filter((id) => !ids.includes(id))
  } else {
    ids.forEach((id) => {
      if (!selectedPermissions.value.includes(id)) selectedPermissions.value.push(id)
    })
  }
}

async function submit() {
  rolesStore.clearError()
  try {
    const role = await rolesStore.create({ name: form.name })
    if (role && selectedPermissions.value.length > 0) {
      await rolesStore.syncPermissions(role.id, selectedPermissions.value)
    }
    await navigateTo('/roles')
  } catch {
    // error set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/roles" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Create Role</h1>
    </div>

    <div class="space-y-5">
      <div class="rounded-2xl bg-white p-6 shadow-sm">
        <AppAlert v-if="rolesStore.error" type="error" :message="rolesStore.error" dismissible class="mb-5" @dismiss="rolesStore.clearError()" />

        <form id="role-form" @submit.prevent="submit">
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="name">Role Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. editor"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>
      </div>

      <!-- Permissions picker -->
      <div class="rounded-2xl bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-sm font-semibold text-gray-900">Assign Permissions</h2>
        <div class="space-y-4">
          <div
            v-for="(perms, resource) in permissionsStore.grouped"
            :key="resource"
            class="rounded-lg border border-gray-100 p-4"
          >
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-semibold capitalize text-gray-700">{{ resource }}</span>
              <button
                type="button"
                class="text-xs text-brand-600 hover:underline"
                @click="toggleGroup(perms.map((p) => p.id))"
              >
                {{ perms.every((p) => selectedPermissions.includes(p.id)) ? 'Deselect all' : 'Select all' }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                :class="selectedPermissions.includes(perm.id)
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'"
              >
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="selectedPermissions.includes(perm.id)"
                  @change="togglePermission(perm.id)"
                />
                {{ perm.name.split(':')[1] }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <NuxtLink
          to="/roles"
          class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
        <button
          form="role-form"
          type="submit"
          :disabled="rolesStore.loading"
          class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <svg v-if="rolesStore.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
          Create Role
        </button>
      </div>
    </div>
  </div>
</template>
