/**
 * Unauthenticated fetch for public pages.
 * - Server-side (SSR): uses the internal Docker network URL (apiBaseInternal)
 * - Client-side:       uses the public browser-accessible URL (public.apiBase)
 * Falls back gracefully (returns null) when the backend returns 401/403.
 */
export function usePublicFetch() {
  const config = useRuntimeConfig()

  // During SSR the frontend container can't reach `localhost:3001`.
  // It must use the Docker service name `backend:3001` instead.
  const base = import.meta.server
    ? (config.apiBaseInternal as string)
    : (config.public.apiBase as string)

  async function publicFetch<T>(path: string, opts?: Parameters<typeof $fetch>[1]): Promise<T | null> {
    try {
      return await $fetch<T>(`${base}${path}`, opts)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401 || status === 403) return null
      throw err
    }
  }

  return { publicFetch }
}
