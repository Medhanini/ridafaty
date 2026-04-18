import type { Permission, CreatePermissionDto } from '~/types'

export const usePermissionsStore = defineStore('permissions', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const permissions = ref<Permission[]>([])
  const currentPermission = ref<Permission | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown, fallback = 'An error occurred') {
    const e = err as { data?: { error?: { message?: string } } }
    error.value = e?.data?.error?.message ?? fallback
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Permission[] }>('/permissions')
      permissions.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load permissions')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Permission }>(`/permissions/${id}`)
      currentPermission.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load permission')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreatePermissionDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Permission }>('/permissions', { method: 'POST', body: dto })
      permissions.value.push(res.data)
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create permission')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: CreatePermissionDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Permission }>(`/permissions/${id}`, {
        method: 'PUT',
        body: dto,
      })
      const idx = permissions.value.findIndex((p) => p.id === id)
      if (idx !== -1) permissions.value[idx] = res.data
      currentPermission.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update permission')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/permissions/${id}`, { method: 'DELETE' })
      permissions.value = permissions.value.filter((p) => p.id !== id)
    } catch (err) {
      handleError(err, 'Failed to delete permission')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Group permissions by resource prefix (e.g. "users" → [users:read, users:create …])
  const grouped = computed(() => {
    return permissions.value.reduce(
      (acc, p) => {
        const resource = p.name.split(':')[0] ?? 'other'
        if (!acc[resource]) acc[resource] = []
        acc[resource].push(p)
        return acc
      },
      {} as Record<string, Permission[]>,
    )
  })

  function clearError() { error.value = null }

  return {
    permissions, currentPermission, grouped, loading, error,
    fetchAll, fetchById, create, update, remove, clearError,
  }
})
