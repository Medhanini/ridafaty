import type { Category, PaginatedResponse, CreateCategoryDto, UpdateCategoryDto } from '~/types'

export const useCategoriesStore = defineStore('categories', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown, fallback = 'An error occurred') {
    const e = err as { data?: { error?: { message?: string } } }
    error.value = e?.data?.error?.message ?? fallback
  }

  async function fetchAll(params: { lang?: string; page?: number; limit?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 20 }
      if (params.lang) query.lang = params.lang
      const res = await $api<PaginatedResponse<Category>>('/categories', { params: query })
      categories.value = res.data
      total.value = res.total
      page.value = res.page
    } catch (err) {
      handleError(err, 'Failed to load categories')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Category }>(`/categories/${id}`)
      currentCategory.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load category')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateCategoryDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Category }>('/categories', { method: 'POST', body: dto })
      categories.value.unshift(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create category')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: UpdateCategoryDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Category }>(`/categories/${id}`, { method: 'PUT', body: dto })
      const idx = categories.value.findIndex((c) => c.id === id)
      if (idx !== -1) categories.value[idx] = res.data
      currentCategory.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update category')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/categories/${id}`, { method: 'DELETE' })
      categories.value = categories.value.filter((c) => c.id !== id)
      total.value--
    } catch (err) {
      handleError(err, 'Failed to delete category')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    categories, currentCategory, total, page, loading, error,
    fetchAll, fetchById, create, update, remove, clearError,
  }
})
