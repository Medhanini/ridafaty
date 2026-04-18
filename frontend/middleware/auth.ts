/**
 * auth – redirect unauthenticated users to /login.
 * Attach to any page via:  definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie<string | null>('ridafaty_token')
  if (!token.value) {
    return navigateTo('/login')
  }
})
