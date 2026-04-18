import type { SubCategory, PaginatedResponse, CreateSubCategoryDto, UpdateSubCategoryDto } from '~/types'

export const useSubCategoriesStore = defineStore('subcategories', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const subcategories = ref<SubCategory[]>([])
  const currentSubCategory = ref<SubCategory | null>(null)
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown, fallback = 'An error occurred') {
    const e = err as { data?: { error?: { message?: string } } }
    error.value = e?.data?.error?.message ?? fallback
  }

  async function fetchAll(params: { lang?: string; categoryId?: number; page?: number; limit?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 100 }
      if (params.lang) query.lang = params.lang
      if (params.categoryId) query.categoryId = params.categoryId
      const res = await $api<PaginatedResponse<SubCategory>>('/subcategories', { params: query })
      subcategories.value = res.data
      total.value = res.total
      page.value = res.page
    } catch (err) {
      handleError(err, 'Failed to load sub-categories')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: SubCategory }>(`/subcategories/${id}`)
      currentSubCategory.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load sub-category')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateSubCategoryDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: SubCategory }>('/subcategories', { method: 'POST', body: dto })
      subcategories.value.unshift(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create sub-category')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: UpdateSubCategoryDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: SubCategory }>(`/subcategories/${id}`, { method: 'PUT', body: dto })
      const idx = subcategories.value.findIndex((s) => s.id === id)
      if (idx !== -1) subcategories.value[idx] = res.data
      currentSubCategory.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update sub-category')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/subcategories/${id}`, { method: 'DELETE' })
      subcategories.value = subcategories.value.filter((s) => s.id !== id)
      total.value--
    } catch (err) {
      handleError(err, 'Failed to delete sub-category')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    subcategories, currentSubCategory, total, page, loading, error,
    fetchAll, fetchById, create, update, remove, clearError,
  }
})
