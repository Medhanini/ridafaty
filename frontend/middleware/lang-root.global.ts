export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/') return
  const { lang } = useLang()
  return navigateTo(`/${lang.value}/`, { replace: true })
})
