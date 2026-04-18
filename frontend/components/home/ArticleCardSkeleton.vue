<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div
    :class="[
      'flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800',
      size === 'lg' ? 'md:flex-row' : '',
    ]"
  >
    <!-- Image placeholder -->
    <div
      :class="[
        'shrink-0 bg-gray-200 dark:bg-gray-700',
        size === 'lg' ? 'aspect-[16/9] md:aspect-auto md:w-1/2' : 'aspect-[16/9]',
      ]"
    />

    <!-- Content placeholder -->
    <div class="flex flex-1 flex-col p-4" :class="size === 'lg' ? 'justify-center md:p-8' : ''">
      <!-- Category badge placeholder -->
      <div class="mb-2 h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />

      <!-- Title placeholder -->
      <div class="space-y-2">
        <div
          :class="[
            'rounded bg-gray-200 dark:bg-gray-700',
            size === 'lg' ? 'h-8 w-4/5' : 'h-5 w-3/4',
          ]"
        />
        <div
          v-if="size !== 'sm'"
          :class="['rounded bg-gray-200 dark:bg-gray-700', size === 'lg' ? 'h-8 w-3/5' : 'h-5 w-1/2']"
        />
      </div>

      <!-- Excerpt lines -->
      <div v-if="size !== 'sm'" class="mt-3 space-y-1.5">
        <div class="h-3 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
        <div class="h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-700/60" />
        <div v-if="size === 'lg'" class="h-3 w-4/5 rounded bg-gray-100 dark:bg-gray-700/60" />
      </div>

      <!-- Meta row placeholder -->
      <div class="mt-4 flex items-center justify-between">
        <div class="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div class="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  </div>
</template>
