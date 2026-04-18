type ColorMode = 'light' | 'dark'

export function useColorMode() {
  const mode = useCookie<ColorMode>('ridafaty_color_mode', {
    default: () => 'light' as ColorMode,
    maxAge: 60 * 60 * 24 * 365,
  })

  const isDark = computed(() => mode.value === 'dark')

  function applyMode(m: ColorMode) {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', m === 'dark')
  }

  // Apply on client mount
  if (import.meta.client) {
    applyMode(mode.value)
  }

  watch(mode, applyMode)

  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  return { mode, isDark, toggle }
}
