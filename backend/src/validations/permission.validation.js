'use strict'

const Joi = require('joi')

const idParam = Joi.object({ params: Joi.object({ id: Joi.number().integer().positive().required() }) })

const createPermissionSchema = Joi.object({
  body: Joi.object({
    // Convention: resource:action  e.g. "users:read"
    name: Joi.string()
      .min(3)
      .max(100)
      .pattern(/^[a-z_]+:[a-z_]+$/)
      .required()
      .messages({ 'string.pattern.base': '"name" must follow the pattern resource:action (e.g. users:read)' }),
    description: Joi.string().max(255).optional(),
  }),
})

const updatePermissionSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .pattern(/^[a-z_]+:[a-z_]+$/)
      .optional(),
    description: Joi.string().max(255).allow('', null).optional(),
  }).min(1),
})

module.exports = { idParam, createPermissionSchema, updatePermissionSchema }
