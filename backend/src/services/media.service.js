'use strict'

const path = require('path')
const fs   = require('fs')

const mediaRepository = require('../repositories/media.repository')
const ApiError = require('../utils/ApiError')

// Marker segment used to detect locally-uploaded files
const LOCAL_PATH_MARKER = '/uploads/images/'

/**
 * Delete a locally-stored upload file.
 * Only acts if the URL contains our marker path; silently ignores errors.
 */
function tryDeleteLocalFile(url) {
  if (!url) return
  const idx = url.indexOf(LOCAL_PATH_MARKER)
  if (idx === -1) return

  const filename = url.slice(idx + LOCAL_PATH_MARKER.length)
  // Safety: must be a plain filename with no extra path segments
  if (!filename || filename.includes('/') || filename.includes('..')) return

  const filePath = path.join(process.cwd(), 'uploads', 'images', filename)
  fs.unlink(filePath, () => {}) // best-effort, ignore errors
}

class MediaService {
  async getAll(query = {}) {
    const { type, page = 1, limit = 20 } = query
    return mediaRepository.findAll({
      type:  type  || undefined,
      page:  Number(page),
      limit: Number(limit),
    })
  }

  async getById(id) {
    const media = await mediaRepository.findById(id)
    if (!media) throw ApiError.notFound(`Media ${id} not found`)
    return media
  }

  async create({ url, type, alt }) {
    return mediaRepository.create({ url, type, alt })
  }

  async update(id, dto) {
    const existing = await this.getById(id)
    // If replacing a locally-uploaded image URL, clean up the old file
    if (dto.url && existing.type === 'image' && existing.url !== dto.url) {
      tryDeleteLocalFile(existing.url)
    }
    return mediaRepository.update(id, dto)
  }

  async delete(id) {
    const media = await this.getById(id)
    // Clean up uploaded image file on delete
    if (media.type === 'image') {
      tryDeleteLocalFile(media.url)
    }
    return mediaRepository.delete(id)
  }
}

module.exports = new MediaService()
