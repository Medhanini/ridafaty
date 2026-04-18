'use strict'

const { verifyToken } = require('../config/jwt')
const { getPrismaClient } = require('../config/database')
const ApiError = require('../utils/ApiError')

/**
 * Verifies the Bearer JWT in the Authorization header and attaches the full
 * user object (with role + permissions) to req.user.
 *
 * Usage: router.use(authenticate)  OR  router.get('/...', authenticate, handler)
 */
async function authenticate(req, _res, next) {
  try {
    const header = req.headers['authorization'] ?? ''
    if (!header.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Missing or malformed Authorization header'))
    }

    const token = header.slice(7)
    const payload = verifyToken(token)

    const db = getPrismaClient()
    const user = await db.user.findUnique({
      where: { id: Number(payload.sub) },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        profile: true,
      },
    })

    if (!user) return next(ApiError.unauthorized('User no longer exists'))

    // Flatten permissions into a Set for O(1) look-ups
    req.user = user
    req.userPermissions = new Set(
      user.role?.permissions.map((rp) => rp.permission.name) ?? [],
    )

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'))
    }
    if (err.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'))
    }
    next(err)
  }
}

module.exports = authenticate
