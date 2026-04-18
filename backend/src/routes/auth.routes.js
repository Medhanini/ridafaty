'use strict'

const { Router } = require('express')
const AuthController = require('../controllers/auth.controller')
const authenticate = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validations/auth.validation')

const router = Router()

// POST /api/auth/register
router.post('/register', validate(registerSchema), AuthController.register)

// POST /api/auth/login
router.post('/login', validate(loginSchema), AuthController.login)

// GET  /api/auth/me  (requires valid token)
router.get('/me', authenticate, AuthController.me)

module.exports = router
