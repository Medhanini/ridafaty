'use strict'

const { Router } = require('express')
const ProfileController = require('../controllers/profile.controller')
const authenticate = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { idParam, updateProfileSchema } = require('../validations/profile.validation')

const router = Router()

router.use(authenticate)

// GET    /api/profiles       – admin: all profiles
// GET    /api/profiles/:id   – own profile or admin
// PUT    /api/profiles/:id   – own profile or admin
// DELETE /api/profiles/:id   – admin only
router.get('/', authorize('profiles:read'), ProfileController.getAll)
router.get('/:id', authorize('profiles:read'), validate(idParam), ProfileController.getById)
router.put('/:id', authorize('profiles:update'), validate(updateProfileSchema), ProfileController.update)
router.delete('/:id', authorize('profiles:delete'), validate(idParam), ProfileController.delete)

module.exports = router
