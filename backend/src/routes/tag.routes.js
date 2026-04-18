'use strict'

const { Router } = require('express')
const TagController = require('../controllers/tag.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, listSchema, createSchema, updateSchema } = require('../validations/tag.validation')

const router = Router()

router
  .route('/')
  .get(validate(listSchema), TagController.getAll)
  .post(authenticate, authorize('tags:create'), validate(createSchema), TagController.create)

router
  .route('/:id')
  .get(validate(idParam), TagController.getById)
  .put(authenticate, authorize('tags:update'), validate(updateSchema), TagController.update)
  .delete(authenticate, authorize('tags:delete'), validate(idParam), TagController.delete)

module.exports = router
