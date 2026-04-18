'use strict'

const { Router } = require('express')
const authRoutes        = require('./auth.routes')
const userRoutes        = require('./user.routes')
const roleRoutes        = require('./role.routes')
const permissionRoutes  = require('./permission.routes')
const profileRoutes     = require('./profile.routes')
const categoryRoutes    = require('./category.routes')
const subcategoryRoutes = require('./subcategory.routes')
const tagRoutes         = require('./tag.routes')
const mediaRoutes       = require('./media.routes')
const articleRoutes     = require('./article.routes')

const router = Router()

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    status:      'ok',
    uptime:      process.uptime(),
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// ── Auth ──────────────────────────────────────────────────────────────────────
router.use('/auth', authRoutes)

// ── RBAC / Users ──────────────────────────────────────────────────────────────
router.use('/users',       userRoutes)
router.use('/roles',       roleRoutes)
router.use('/permissions', permissionRoutes)
router.use('/profiles',    profileRoutes)

// ── CMS ───────────────────────────────────────────────────────────────────────
router.use('/categories',    categoryRoutes)
router.use('/subcategories', subcategoryRoutes)
router.use('/tags',          tagRoutes)
router.use('/media',         mediaRoutes)
router.use('/articles',      articleRoutes)

module.exports = router
