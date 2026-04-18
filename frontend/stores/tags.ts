import type { Tag, PaginatedResponse, CreateTagDto, UpdateTagDto } from '~/types'

export const useTagsStore = defineStore('tags', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const tags = ref<Tag[]>([])
  const currentTag = ref<Tag | null>(null)
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
      const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 100 }
      if (params.lang) query.lang = params.lang
      const res = await $api<PaginatedResponse<Tag>>('/tags', { params: query })
      tags.value = res.data
      total.value = res.total
      page.value = res.page
    } catch (err) {
      handleError(err, 'Failed to load tags')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Tag }>(`/tags/${id}`)
      currentTag.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load tag')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateTagDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Tag }>('/tags', { method: 'POST', body: dto })
      tags.value.push(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to create tag')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: UpdateTagDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Tag }>(`/tags/${id}`, { method: 'PUT', body: dto })
      const idx = tags.value.findIndex((t) => t.id === id)
      if (idx !== -1) tags.value[idx] = res.data
      currentTag.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update tag')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/tags/${id}`, { method: 'DELETE' })
      tags.value = tags.value.filter((t) => t.id !== id)
      total.value--
    } catch (err) {
      handleError(err, 'Failed to delete tag')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    tags, currentTag, total, page, loading, error,
    fetchAll, fetchById, create, update, remove, clearError,
  }
})
