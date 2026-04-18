import type { Media, PaginatedResponse, CreateMediaDto, UpdateMediaDto } from '~/types'

export const useMediasStore = defineStore('medias', () => {
  const nuxtApp = useNuxtApp()
  const $api = (nuxtApp as unknown as { $api: typeof $fetch }).$api

  const medias       = ref<Media[]>([])
  const currentMedia = ref<Media | null>(null)
  const total        = ref(0)
  const page         = ref(1)
  const loading      = ref(false)
  const error        = ref<string | null>(null)

  function handleError(err: unknown, fallback = 'An error occurred') {
    const e = err as { data?: { error?: { message?: string } } }
    error.value = e?.data?.error?.message ?? fallback
  }

  async function fetchAll(params: { type?: string; page?: number; limit?: number } = {}) {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 20 }
      if (params.type) query.type = params.type
      const res = await $api<PaginatedResponse<Media>>('/media', { params: query })
      medias.value = res.data
      total.value  = res.total
      page.value   = res.page
    } catch (err) {
      handleError(err, 'Failed to load media')
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Media }>(`/media/${id}`)
      currentMedia.value = res.data
    } catch (err) {
      handleError(err, 'Failed to load media')
    } finally {
      loading.value = false
    }
  }

  // Create a video record (URL-based)
  async function create(dto: CreateMediaDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Media }>('/media', { method: 'POST', body: dto })
      medias.value.unshift(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to add media')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Upload an image file → POST /media/upload (multipart)
  async function uploadImage(file: File, alt?: string): Promise<Media> {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (alt) formData.append('alt', alt)
      const res = await $api<{ success: true; data: Media }>('/media/upload', {
        method: 'POST',
        body: formData,
      })
      medias.value.unshift(res.data)
      total.value++
      return res.data
    } catch (err) {
      handleError(err, 'Failed to upload image')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Replace image file for an existing record → POST /media/:id/reupload
  async function reuploadImage(id: number, file: File, alt?: string): Promise<Media> {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (alt !== undefined) formData.append('alt', alt)
      const res = await $api<{ success: true; data: Media }>(`/media/${id}/reupload`, {
        method: 'POST',
        body: formData,
      })
      const idx = medias.value.findIndex((m) => m.id === id)
      if (idx !== -1) medias.value[idx] = res.data
      currentMedia.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to re-upload image')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, dto: UpdateMediaDto) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ data: Media }>(`/media/${id}`, { method: 'PUT', body: dto })
      const idx = medias.value.findIndex((m) => m.id === id)
      if (idx !== -1) medias.value[idx] = res.data
      currentMedia.value = res.data
      return res.data
    } catch (err) {
      handleError(err, 'Failed to update media')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true
    error.value = null
    try {
      await $api(`/media/${id}`, { method: 'DELETE' })
      medias.value = medias.value.filter((m) => m.id !== id)
      total.value--
    } catch (err) {
      handleError(err, 'Failed to delete media')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    medias, currentMedia, total, page, loading, error,
    fetchAll, fetchById, create, uploadImage, reuploadImage, update, remove, clearError,
  }
})
