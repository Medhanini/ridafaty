import type { User, PaginatedResponse, CreateUserDto, UpdateUserDto } from '~/types'

export const useUsersStore = defineStore('users', () => {
  // Capture the API instance once during store setup (Vue/Nuxt composable context)
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function handleError(err: unknown, fallback = 'An error occurred') {
    const e = err as { data?: { error?: { message?: string } } }
    error.value = e?.data?.error?.message ?? fallback
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchAll(params: { page?: number; limit?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<PaginatedResponse<User>>('/users', {
        params: { page: params.page ?? 1, limit: params.limit ?? 15 },
      })
      users.value = res.data
      total.value = res.total
      page.value = res.page
    } catch (err) {
      handleError(err, 'Failed to load users')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: User }>(`/users/${id}`)
      currentUser.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load user')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateUserDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: User }>('/users', { method: 'POST', body: dto })
      users.value.unshift(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create user')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: UpdateUserDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: User }>(`/users/${id}`, { method: 'PUT', body: dto })
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx !== -1) users.value[idx] = res.data
      currentUser.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update user')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/users/${id}`, { method: 'DELETE' })
      users.value = users.value.filter((u) => u.id !== id)
      total.value--
    } catch (err) {
      handleError(err, 'Failed to delete user')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    users, currentUser, total, page, loading, error,
    fetchAll, fetchById, create, update, remove, clearError,
  }
})
