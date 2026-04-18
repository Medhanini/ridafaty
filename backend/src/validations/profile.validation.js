'use strict'

const Joi = require('joi')

const idParam = Joi.object({ params: Joi.object({ id: Joi.number().integer().positive().required() }) })

const updateProfileSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    bio: Joi.string().max(1000).allow('', null).optional(),
    avatar: Joi.string().uri().max(500).allow('', null).optional(),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-().]{7,20}$/)
      .allow('', null)
      .optional()
      .messages({ 'string.pattern.base': '"phone" must be a valid phone number' }),
  }).min(1),
})

module.exports = { idParam, updateProfileSchema }
