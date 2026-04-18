<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()

const adminNav = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: 'Users', to: '/users', icon: 'users' },
  { label: 'Roles', to: '/roles', icon: 'shield' },
  { label: 'Permissions', to: '/permissions', icon: 'key' },
]

const cmsNav = [
  { label: 'Articles', to: '/articles', icon: 'file-text' },
  { label: 'Categories', to: '/categories', icon: 'folder' },
  { label: 'Sub-Categories', to: '/subcategories', icon: 'folder-open' },
  { label: 'Tags', to: '/tags', icon: 'tag' },
  { label: 'Media', to: '/medias', icon: 'image' },
]

function isActive(to: string) {
  return route.path === to || (to !== '/dashboard' && route.path.startsWith(to))
}

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Mobile overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white shadow-lg transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <span class="text-lg font-bold text-gray-900">Ridafaty</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <!-- Admin section -->
        <div>
          <p class="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Admin</p>
          <ul class="space-y-1">
            <li v-for="item in adminNav" :key="item.to">
              <NuxtLink
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ]"
                @click="sidebarOpen = false"
              >
                <svg v-if="item.icon === 'grid'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                <svg v-if="item.icon === 'users'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <svg v-if="item.icon === 'shield'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <svg v-if="item.icon === 'key'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- CMS section -->
        <div>
          <p class="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">CMS</p>
          <ul class="space-y-1">
            <li v-for="item in cmsNav" :key="item.to">
              <NuxtLink
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ]"
                @click="sidebarOpen = false"
              >
                <svg v-if="item.icon === 'file-text'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                <svg v-if="item.icon === 'folder'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-if="item.icon === 'folder-open'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polyline points="2 10 12 10 22 10"/>
                </svg>
                <svg v-if="item.icon === 'tag'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <svg v-if="item.icon === 'image'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- User info & logout -->
      <div class="border-t border-gray-100 p-4">
        <div class="mb-3 flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {{ auth.user?.email?.[0]?.toUpperCase() ?? 'U' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">{{ auth.user?.email ?? '…' }}</p>
            <p class="truncate text-xs text-gray-500">{{ auth.user?.role?.name ?? 'user' }}</p>
          </div>
        </div>
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          @click="auth.logout()"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-6">
        <button
          type="button"
          class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          @click="sidebarOpen = true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="flex-1" />
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
