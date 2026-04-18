/**
 * guest – redirect already-authenticated users away from the login page.
 * Attach via:  definePageMeta({ middleware: 'guest' })
 */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie<string | null>('ridafaty_token')
  if (token.value) {
    return navigateTo('/dashboard')
  }
})
