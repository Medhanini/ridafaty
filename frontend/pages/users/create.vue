<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Create User — Ridafaty' })

const usersStore = useUsersStore()
const rolesStore = useRolesStore()

await rolesStore.fetchAll()

const form = reactive({
  email: '',
  password: '',
  roleId: undefined as number | undefined,
})

const success = ref(false)

async function submit() {
  success.value = false
  try {
    await usersStore.create({ ...form })
    await navigateTo('/users')
  } catch {
    // error is already set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/users" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Create User</h1>
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm">
      <AppAlert v-if="usersStore.error" type="error" :message="usersStore.error" dismissible class="mb-5" @dismiss="usersStore.clearError()" />

      <form class="space-y-5" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="user@example.com"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="8"
            placeholder="Min. 8 characters"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="role">Role</label>
          <select
            id="role"
            v-model="form.roleId"
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option :value="undefined">— No role —</option>
            <option v-for="role in rolesStore.roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <NuxtLink
            to="/users"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="usersStore.loading"
            class="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="usersStore.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Create User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
