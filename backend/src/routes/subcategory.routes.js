'use strict'

const { Router } = require('express')
const SubCategoryController = require('../controllers/subcategory.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, listSchema, createSchema, updateSchema } = require('../validations/subcategory.validation')

const router = Router()

router
  .route('/')
  .get(validate(listSchema), SubCategoryController.getAll)
  .post(authenticate, authorize('subcategories:create'), validate(createSchema), SubCategoryController.create)

// GET /api/subcategories/slug/:slug – public, SEO-friendly lookup
router.get('/slug/:slug', SubCategoryController.getBySlug)

router
  .route('/:id')
  .get(validate(idParam), SubCategoryController.getById)
  .put(authenticate, authorize('subcategories:update'), validate(updateSchema), SubCategoryController.update)
  .delete(authenticate, authorize('subcategories:delete'), validate(idParam), SubCategoryController.delete)

module.exports = router
