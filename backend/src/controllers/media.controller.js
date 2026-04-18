'use strict'

const mediaService = require('../services/media.service')
const ApiError     = require('../utils/ApiError')

/**
 * Construct the public URL for a locally-uploaded file.
 * APP_URL is injected via environment (e.g. http://localhost:3001).
 * Falls back to deriving it from the incoming request as a last resort.
 */
function buildUploadUrl(req, filename) {
  const base = process.env.APP_URL
    || `${req.protocol}://${req.get('host')}`
  return `${base}/uploads/images/${filename}`
}

const MediaController = {
  async getAll(req, res, next) {
    try {
      const result = await mediaService.getAll(req.query)
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  },

  async getById(req, res, next) {
    try {
      const media = await mediaService.getById(Number(req.params.id))
      res.json({ success: true, data: media })
    } catch (err) { next(err) }
  },

  // POST /api/media  →  create a video record (URL-based)
  async create(req, res, next) {
    try {
      const media = await mediaService.create(req.body)
      res.status(201).json({ success: true, data: media })
    } catch (err) { next(err) }
  },

  // POST /api/media/upload  →  upload image file + create record
  async upload(req, res, next) {
    try {
      if (!req.file) return next(ApiError.badRequest('No image file provided'))
      const url   = buildUploadUrl(req, req.file.filename)
      const media = await mediaService.create({
        url,
        type: 'image',
        alt:  req.body.alt || null,
      })
      res.status(201).json({ success: true, data: media })
    } catch (err) { next(err) }
  },

  // POST /api/media/:id/reupload  →  replace the image file for an existing record
  async reupload(req, res, next) {
    try {
      if (!req.file) return next(ApiError.badRequest('No image file provided'))
      const url   = buildUploadUrl(req, req.file.filename)
      const patch = { url }
      if (req.body.alt !== undefined) patch.alt = req.body.alt
      const media = await mediaService.update(Number(req.params.id), patch)
      res.json({ success: true, data: media })
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const media = await mediaService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: media })
    } catch (err) { next(err) }
  },

  async delete(req, res, next) {
    try {
      await mediaService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) { next(err) }
  },
}

module.exports = MediaController
