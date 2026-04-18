<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false, middleware: 'guest' })
useSeoMeta({ title: 'Sign in — Idafaty' })

const auth = useAuthStore()

const form = reactive({ email: '', password: '' })

async function submit() {
  await auth.login(form)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="mb-8 flex flex-col items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Idafaty Admin</h1>
        <p class="text-sm text-gray-500">Sign in to your account</p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl bg-white p-8 shadow-xl">
        <AppAlert
          v-if="auth.error"
          type="error"
          :message="auth.error"
          dismissible
          class="mb-5"
          @dismiss="auth.clearError()"
        />

        <form class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700" for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              placeholder="admin@Idafaty.com"
              class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700" for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            type="submit"
            :disabled="auth.loading"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <svg v-if="auth.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            {{ auth.loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
