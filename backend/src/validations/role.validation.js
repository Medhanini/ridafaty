'use strict'

const Joi = require('joi')

const idParam = Joi.object({ params: Joi.object({ id: Joi.number().integer().positive().required() }) })

const createRoleSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(50).lowercase().required(),
    description: Joi.string().max(255).optional(),
  }),
})

const updateRoleSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(50).lowercase().optional(),
    description: Joi.string().max(255).allow('', null).optional(),
  }).min(1),
})

module.exports = { idParam, createRoleSchema, updateRoleSchema }
