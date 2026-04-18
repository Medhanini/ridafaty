'use strict'

const Joi = require('joi')

const password = Joi.string()
  .min(8)
  .max(72) // bcrypt hard limit
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({
    'string.pattern.base':
      '"password" must contain at least one uppercase letter, one lowercase letter, and one number',
  })

const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().lowercase().required(),
    password: password.required(),
  }),
})

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),
})

module.exports = { registerSchema, loginSchema }
