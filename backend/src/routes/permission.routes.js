'use strict'

const { Router } = require('express')
const PermissionController = require('../controllers/permission.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, createPermissionSchema, updatePermissionSchema } = require('../validations/permission.validation')

const router = Router()

router.use(authenticate)

router
  .route('/')
  .get(authorize('permissions:read'), PermissionController.getAll)
  .post(authorize('permissions:create'), validate(createPermissionSchema), PermissionController.create)

router
  .route('/:id')
  .get(authorize('permissions:read'), validate(idParam), PermissionController.getById)
  .put(authorize('permissions:update'), validate(updatePermissionSchema), PermissionController.update)
  .delete(authorize('permissions:delete'), validate(idParam), PermissionController.delete)

module.exports = router
