/**
 * API plugin – provides a pre-configured $fetch instance ($api).
 *
 * • Automatically injects the Bearer token from the shared cookie
 * • Handles 401 → clears token + redirects to /login
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // The cookie is the single source of truth for the JWT.
  // Calling useCookie here (plugin setup) gives us a reactive ref that is
  // kept in sync with the auth store, which uses the same cookie key.
  const token = useCookie<string | null>('ridafaty_token')

  const api = $fetch.create({
    baseURL: config.public.apiBase as string,

    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers(options.headers as HeadersInit)
        headers.set('Authorization', `Bearer ${token.value}`)
        options.headers = headers
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        token.value = null
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
