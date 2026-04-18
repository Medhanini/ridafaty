<script setup lang="ts">
defineProps<{
  type?: 'error' | 'success' | 'warning' | 'info'
  message: string
  dismissible?: boolean
}>()

defineEmits<{ dismiss: [] }>()

const styles = {
  error:   'bg-red-50   border-red-300   text-red-800',
  success: 'bg-green-50 border-green-300 text-green-800',
  warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  info:    'bg-blue-50  border-blue-300  text-blue-800',
}
</script>

<template>
  <div
    v-if="message"
    :class="['flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm', styles[type ?? 'error']]"
    role="alert"
  >
    <span>{{ message }}</span>
    <button
      v-if="dismissible"
      class="shrink-0 opacity-60 hover:opacity-100"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>
