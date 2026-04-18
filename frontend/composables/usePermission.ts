import { useAuthStore } from '~/stores/auth'

/**
 * Reuses the existing auth store's user.role.permissions to check RBAC.
 * Returns false when user data hasn't loaded yet (safe default).
 */
export function usePermission() {
  const auth = useAuthStore()

  // Flatten permission names from the existing RolePermission[] structure
  const permissions = computed<Set<string>>(() => {
    const list = auth.user?.role?.permissions ?? []
    return new Set(list.map((rp) => rp.permission.name))
  })

  function can(permission: string): boolean {
    if (!auth.user) return false
    // admin role has all permissions
    if (auth.user.role?.name === 'admin') return true
    return permissions.value.has(permission)
  }

  return { can }
}
