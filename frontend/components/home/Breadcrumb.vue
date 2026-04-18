<script setup lang="ts">
defineProps<{
  items: { label: string; to?: string }[]
}>()

const { isRTL } = useLang()
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol
      class="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
      :class="isRTL ? 'flex-row-reverse' : ''"
    >
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-1.5">
        <!-- Separator (skip before first item) -->
        <svg
          v-if="i > 0"
          class="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600"
          :class="isRTL ? 'rotate-180' : ''"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>

        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >{{ item.label }}</NuxtLink>
        <span v-else class="font-medium text-gray-900 dark:text-white">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
