import type { User, LoginCredentials } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  // useCookie is SSR-safe and shares the same ref with the API plugin
  const token = useCookie<string | null>('ridafaty_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })

  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  // ── Actions ───────────────────────────────────────────────────────────────

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    const config = useRuntimeConfig()
    try {
      const res = await $fetch<{ data: { user: User; token: string } }>('/auth/login', {
        method: 'POST',
        baseURL: config.public.apiBase as string,
        body: credentials,
      })
      token.value = res.data.token
      user.value = res.data.user
      await navigateTo('/dashboard')
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } }
      error.value = e?.data?.error?.message ?? 'Invalid credentials'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    const config = useRuntimeConfig()
    try {
      const res = await $fetch<{ data: User }>('/auth/me', {
        baseURL: config.public.apiBase as string,
        headers: { Authorization: `Bearer ${token.value}` },
      })
      user.value = res.data
    } catch {
      // Token expired or invalid – the API plugin will handle 401 globally
    }
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  function clearError() {
    error.value = null
  }

  return { token, user, loading, error, isAuthenticated, login, fetchMe, logout, clearError }
})
