'use strict'

const ApiError = require('../utils/ApiError')

/**
 * Require that the authenticated user holds AT LEAST ONE of the listed permissions.
 *
 * Must be used AFTER `authenticate`.
 *
 * @param {...string} perms  e.g. authorize('users:read', 'users:create')
 *
 * @example
 *   router.get('/', authenticate, authorize('users:read'), UserController.getAll)
 */
function authorize(...perms) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'))
    }

    const hasPermission = perms.some((p) => req.userPermissions.has(p))
    if (!hasPermission) {
      return next(
        ApiError.forbidden(
          `Insufficient permissions. Required: ${perms.join(' | ')}`,
        ),
      )
    }
    next()
  }
}

/**
 * Require that the authenticated user's role name matches one of the provided roles.
 *
 * @param {...string} roles  e.g. requireRole('admin', 'moderator')
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'))
    }

    const userRole = req.user.role?.name
    if (!userRole || !roles.includes(userRole)) {
      return next(ApiError.forbidden(`Role required: ${roles.join(' | ')}`))
    }
    next()
  }
}

module.exports = { authorize, requireRole }
