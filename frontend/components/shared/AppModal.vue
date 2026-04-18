<script setup lang="ts">
defineProps<{
  show: boolean
  title?: string
  message?: string
  confirmLabel?: string
  loading?: boolean
}>()

defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="$emit('cancel')"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            {{ title ?? 'Are you sure?' }}
          </h3>
          <p class="mb-6 text-sm text-gray-500">
            {{ message ?? 'This action cannot be undone.' }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="loading"
              @click="$emit('cancel')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              {{ confirmLabel ?? 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
