'use strict'

const { Router } = require('express')
const RoleController = require('../controllers/role.controller')
const RoleHasPermissionController = require('../controllers/roleHasPermission.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, createRoleSchema, updateRoleSchema } = require('../validations/role.validation')

const router = Router()

router.use(authenticate)

router
  .route('/')
  .get(authorize('roles:read'), RoleController.getAll)
  .post(authorize('roles:create'), validate(createRoleSchema), RoleController.create)

router
  .route('/:id')
  .get(authorize('roles:read'), validate(idParam), RoleController.getById)
  .put(authorize('roles:update'), validate(updateRoleSchema), RoleController.update)
  .delete(authorize('roles:delete'), validate(idParam), RoleController.delete)

// ── Permission assignment sub-routes ─────────────────────────────────────────
// POST   /api/roles/:id/permissions        – assign
// PUT    /api/roles/:id/permissions        – sync (replace all)
// DELETE /api/roles/:id/permissions/:permId – revoke one
router.post('/:id/permissions', authorize('roles:update'), RoleHasPermissionController.assign)
router.put('/:id/permissions', authorize('roles:update'), RoleHasPermissionController.sync)
router.delete('/:id/permissions/:permId', authorize('roles:update'), RoleHasPermissionController.revoke)

module.exports = router
