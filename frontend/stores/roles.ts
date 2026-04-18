import type { Role, CreateRoleDto } from '~/types'

export const useRolesStore = defineStore('roles', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const roles = ref<Role[]>([])
  const currentRole = ref<Role | null>(null)
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
      const res = await $api<{ data: Role[] }>('/roles')
      roles.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load roles')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Role }>(`/roles/${id}`)
      currentRole.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load role')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateRoleDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Role }>('/roles', { method: 'POST', body: dto })
      roles.value.push(res.data)
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create role')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: CreateRoleDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Role }>(`/roles/${id}`, { method: 'PUT', body: dto })
      const idx = roles.value.findIndex((r) => r.id === id)
      if (idx !== -1) roles.value[idx] = res.data
      currentRole.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update role')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/roles/${id}`, { method: 'DELETE' })
      roles.value = roles.value.filter((r) => r.id !== id)
    } catch (err) {
      handleError(err, 'Failed to delete role')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function syncPermissions(roleId: number, permissionIds: number[]) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Role }>(`/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: { permissionIds },
      })
      const idx = roles.value.findIndex((r) => r.id === roleId)
      if (idx !== -1) roles.value[idx] = res.data
      currentRole.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update permissions')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    roles, currentRole, loading, error,
    fetchAll, fetchById, create, update, remove, syncPermissions, clearError,
  }
})
