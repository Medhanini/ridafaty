'use strict'

const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const ApiError = require('../utils/ApiError')

const UPLOADS_DIR  = path.join(process.cwd(), 'uploads', 'images')
const MAX_SIZE_MB   = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
])

// Ensure the uploads directory exists at startup
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename(_req, file, cb) {
    const ext    = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    cb(null, `${unique}${ext}`)
  },
})

const _multerInstance = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(ApiError.badRequest(
        'Unsupported file type. Allowed formats: JPEG, PNG, GIF, WebP, SVG',
      ))
    }
  },
})

/**
 * Wraps multer.single() to convert MulterError into ApiError so the
 * centralized error middleware returns a proper 400 JSON response.
 *
 * Usage (in routes):
 *   upload.single('file')
 */
const upload = {
  single(fieldname) {
    return (req, res, next) => {
      _multerInstance.single(fieldname)(req, res, (err) => {
        if (!err) return next()

        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(ApiError.badRequest(
              `File too large. Maximum allowed size: ${MAX_SIZE_MB} MB`,
            ))
          }
          return next(ApiError.badRequest(err.message))
        }

        // Pass through ApiError thrown from fileFilter or unknown errors
        next(err)
      })
    }
  },
}

module.exports = upload
