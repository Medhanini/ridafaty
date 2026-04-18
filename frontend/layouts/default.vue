<script setup lang="ts">
const { isDark }  = useColorMode()
const { isRTL, lang } = useLang()

useHead({
  htmlAttrs: computed(() => ({
    class: isDark.value ? 'dark' : '',
    dir:   isRTL.value ? 'rtl' : 'ltr',
    lang:  lang.value,
  })),
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
    <AppNavbar />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
