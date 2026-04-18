<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Edit User — Idafaty' })

const route = useRoute()
const id = Number(route.params.id)

const usersStore = useUsersStore()
const rolesStore = useRolesStore()

await Promise.all([usersStore.fetchById(id), rolesStore.fetchAll()])

const user = computed(() => usersStore.currentUser)

const form = reactive({
  email: user.value?.email ?? '',
  password: '',
  roleId: user.value?.roleId ?? undefined as number | undefined,
})

// Keep form in sync if user loads after reactive setup
watch(user, (u) => {
  if (u) {
    form.email = u.email
    form.roleId = u.roleId ?? undefined
  }
}, { immediate: true })

const success = ref(false)

async function submit() {
  success.value = false
  usersStore.clearError()
  const dto: Record<string, unknown> = { email: form.email, roleId: form.roleId }
  if (form.password) dto.password = form.password
  try {
    await usersStore.update(id, dto as Parameters<typeof usersStore.update>[1])
    success.value = true
  } catch {
    // error set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/users" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Edit User</h1>
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm">
      <AppAlert v-if="usersStore.error" type="error" :message="usersStore.error" dismissible class="mb-5" @dismiss="usersStore.clearError()" />
      <AppAlert v-if="success" type="success" message="User updated successfully." dismissible class="mb-5" @dismiss="success = false" />

      <form v-if="user" class="space-y-5" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700" for="password">
            New Password
            <span class="ml-1 font-normal text-gray-400">(leave blank to keep current)</span>
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            minlength="8"
            placeholder="••••••••"
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
            Save Changes
          </button>
        </div>
      </form>

      <div v-else class="py-8 text-center text-sm text-gray-400">User not found.</div>
    </div>
  </div>
</template>
