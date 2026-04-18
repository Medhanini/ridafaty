<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'
import { usePermissionsStore } from '~/stores/permissions'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useSeoMeta({ title: 'Dashboard — Idafaty' })

const auth = useAuthStore()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()

await Promise.all([
  usersStore.fetchAll({ page: 1, limit: 1 }),
  rolesStore.fetchAll(),
  permissionsStore.fetchAll(),
])

const stats = computed(() => [
  { label: 'Total Users', value: usersStore.total, icon: 'users', color: 'bg-blue-500' },
  { label: 'Roles', value: rolesStore.roles.length, icon: 'shield', color: 'bg-purple-500' },
  { label: 'Permissions', value: permissionsStore.permissions.length, icon: 'key', color: 'bg-amber-500' },
])
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">
        Welcome back, <span class="font-medium">{{ auth.user?.email }}</span>
      </p>
    </div>

    <!-- Stats -->
    <div class="grid gap-5 sm:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"
      >
        <div :class="['flex h-12 w-12 items-center justify-center rounded-xl text-white', stat.color]">
          <!-- Users -->
          <svg v-if="stat.icon === 'users'" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <!-- Shield -->
          <svg v-if="stat.icon === 'shield'" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <!-- Key -->
          <svg v-if="stat.icon === 'key'" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Quick links -->
    <div class="mt-8">
      <h2 class="mb-4 text-base font-semibold text-gray-900">Quick Access</h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <NuxtLink
          v-for="item in [
            { label: 'Manage Users', to: '/users', desc: 'Create, edit, and remove users' },
            { label: 'Manage Roles', to: '/roles', desc: 'Define roles and assign permissions' },
            { label: 'Manage Permissions', to: '/permissions', desc: 'View and configure permissions' },
          ]"
          :key="item.to"
          :to="item.to"
          class="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:ring-brand-300"
        >
          <p class="font-semibold text-gray-900 group-hover:text-brand-700">{{ item.label }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ item.desc }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
