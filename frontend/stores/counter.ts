/**
 * Sample Pinia store.
 * Replace or extend this with your real domain stores.
 */
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  return { count, increment, decrement, reset }
})
