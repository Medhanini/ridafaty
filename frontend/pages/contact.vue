<script setup lang="ts">
useSeoMeta({
  title: 'Contact',
  description: 'Get in touch with the Ridafaty team.',
})

const form = reactive({ name: '', email: '', message: '' })
const submitted = ref(false)

function handleSubmit() {
  // Replace with your real API call / form service
  submitted.value = true
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-20 sm:px-6">
    <h1 class="mb-8 text-4xl font-bold tracking-tight text-gray-900">Contact</h1>

    <Transition name="fade" mode="out-in">
      <div v-if="submitted" class="rounded-xl bg-green-50 p-6 text-green-700">
        <p class="font-semibold">Thanks for reaching out!</p>
        <p class="mt-1 text-sm">We'll get back to you as soon as possible.</p>
      </div>

      <form v-else class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Jane Doe"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="jane@example.com"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label for="message" class="mb-1 block text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="message"
            v-model="form.message"
            rows="5"
            required
            placeholder="Tell us how we can help…"
            class="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Send message
        </button>
      </form>
    </Transition>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
