'use strict'

const { Router } = require('express')
const CategoryController = require('../controllers/category.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, listSchema, createSchema, updateSchema } = require('../validations/category.validation')

const router = Router()

// GET  /api/categories     – public list
// POST /api/categories     – create (requires categories:create)
router
  .route('/')
  .get(validate(listSchema), CategoryController.getAll)
  .post(authenticate, authorize('categories:create'), validate(createSchema), CategoryController.create)

// GET /api/categories/slug/:slug – public, SEO-friendly lookup
router.get('/slug/:slug', CategoryController.getBySlug)

// GET    /api/categories/:id
// PUT    /api/categories/:id  – update (requires categories:update)
// DELETE /api/categories/:id  – delete (requires categories:delete)
router
  .route('/:id')
  .get(validate(idParam), CategoryController.getById)
  .put(authenticate, authorize('categories:update'), validate(updateSchema), CategoryController.update)
  .delete(authenticate, authorize('categories:delete'), validate(idParam), CategoryController.delete)

module.exports = router
