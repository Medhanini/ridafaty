'use strict'

const { Router } = require('express')
const ArticleController = require('../controllers/article.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, listSchema, createSchema, updateSchema } = require('../validations/article.validation')

const router = Router()

// GET  /api/articles          – public list with optional filters
// POST /api/articles          – create (authenticated writers)
router
  .route('/')
  .get(validate(listSchema), ArticleController.getAll)
  .post(authenticate, authorize('articles:create'), validate(createSchema), ArticleController.create)

// GET /api/articles/slug/:slug – public, SEO-friendly endpoint
router.get('/slug/:slug', ArticleController.getBySlug)

// GET    /api/articles/:id
// PUT    /api/articles/:id
// DELETE /api/articles/:id
router
  .route('/:id')
  .get(validate(idParam), ArticleController.getById)
  .put(authenticate, authorize('articles:update'), validate(updateSchema), ArticleController.update)
  .delete(authenticate, authorize('articles:delete'), validate(idParam), ArticleController.delete)

module.exports = router
