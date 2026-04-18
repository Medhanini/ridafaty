/**
 * Thin wrapper around Nuxt's runtimeConfig so consuming components
 * never import useRuntimeConfig directly (easier to mock in tests).
 */
export function useRuntimeSettings() {
  const config = useRuntimeConfig()

  return {
    apiBase: config.public.apiBase as string,
    appName: config.public.appName as string,
  }
}
