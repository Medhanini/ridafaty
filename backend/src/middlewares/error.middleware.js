'use strict'

const logger = require('../utils/logger')
const ApiError = require('../utils/ApiError')
const env = require('../config/env')

/**
 * Centralized error handler.
 * Must be registered LAST in Express – after all routes and other middleware.
 *
 * Handles:
 *  - ApiError  → shaped JSON with the given status code
 *  - Prisma errors  → translated to user-friendly responses
 *  - Unknown errors  → 500 (stack hidden in production)
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, _next) {
  // ── Prisma known errors ──────────────────────────────────────────────────
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.join(', ') ?? 'field'
    return res.status(409).json(buildError(409, `A record with this ${field} already exists.`))
  }
  if (err.code === 'P2025') {
    // Record not found (e.g. update/delete on non-existent row)
    return res.status(404).json(buildError(404, err.meta?.cause ?? 'Record not found.'))
  }

  // ── Operational ApiError ─────────────────────────────────────────────────
  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json(buildError(err.statusCode, err.message))
  }

  // ── Unexpected / programming error ──────────────────────────────────────
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  return res.status(500).json(
    buildError(500, 'Internal Server Error', env.isDev ? err.stack : undefined),
  )
}

function buildError(status, message, detail) {
  return {
    success: false,
    error: { status, message, ...(detail && { detail }) },
  }
}

module.exports = errorMiddleware
