'use strict'

const ApiError = require('../utils/ApiError')

/**
 * Catch-all for routes that don't exist.
 * Must be registered AFTER all routes but BEFORE errorMiddleware.
 */
function notFoundMiddleware(req, _res, next) {
  next(ApiError.notFound(`Cannot ${req.method} ${req.path}`))
}

module.exports = notFoundMiddleware
