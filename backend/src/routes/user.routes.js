'use strict'

const { Router } = require('express')
const UserController = require('../controllers/user.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { paginationSchema, idParam, createUserSchema, updateUserSchema } = require('../validations/user.validation')

const router = Router()

// All user routes require authentication
router.use(authenticate)

// GET  /api/users          – list  (requires users:read)
// POST /api/users          – create (requires users:create)
router
  .route('/')
  .get(authorize('users:read'), validate(paginationSchema), UserController.getAll)
  .post(authorize('users:create'), validate(createUserSchema), UserController.create)

// GET    /api/users/:id    – read one  (requires users:read)
// PUT    /api/users/:id    – full update (requires users:update)
// DELETE /api/users/:id    – delete (requires users:delete)
router
  .route('/:id')
  .get(authorize('users:read'), validate(idParam), UserController.getById)
  .put(authorize('users:update'), validate(updateUserSchema), UserController.update)
  .delete(authorize('users:delete'), validate(idParam), UserController.delete)

module.exports = router
