import type { Article, PaginatedResponse, CreateArticleDto, UpdateArticleDto } from '~/types'

export const useArticlesStore = defineStore('articles', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown, fallback = 'An error occurred') {
    const e = err as { data?: { error?: { message?: string } } }
    error.value = e?.data?.error?.message ?? fallback
  }

  async function fetchAll(params: { lang?: string; subCategoryId?: number; page?: number; limit?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 15 }
      if (params.lang) query.lang = params.lang
      if (params.subCategoryId) query.subCategoryId = params.subCategoryId
      const res = await $api<PaginatedResponse<Article>>('/articles', { params: query })
      articles.value = res.data
      total.value = res.total
      page.value = res.page
    } catch (err) {
      handleError(err, 'Failed to load articles')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Article }>(`/articles/${id}`)
      currentArticle.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load article')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateArticleDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Article }>('/articles', { method: 'POST', body: dto })
      articles.value.unshift(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create article')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: UpdateArticleDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Article }>(`/articles/${id}`, { method: 'PUT', body: dto })
      const idx = articles.value.findIndex((a) => a.id === id)
      if (idx !== -1) articles.value[idx] = res.data
      currentArticle.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update article')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/articles/${id}`, { method: 'DELETE' })
      articles.value = articles.value.filter((a) => a.id !== id)
      total.value--
    } catch (err) {
      handleError(err, 'Failed to delete article')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    articles, currentArticle, total, page, loading, error,
    fetchAll, fetchById, create, update, remove, clearError,
  }
})
