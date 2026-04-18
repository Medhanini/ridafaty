'use strict'

const Joi = require('joi')

const idParam = Joi.object({ params: Joi.object({ id: Joi.number().integer().positive().required() }) })

const createUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(72).required(),
    roleId: Joi.number().integer().positive().optional(),
  }),
})

const updateUserSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().lowercase().optional(),
    password: Joi.string().min(8).max(72).optional(),
    roleId: Joi.number().integer().positive().allow(null).optional(),
  }).min(1),
})

const paginationSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
})

module.exports = { idParam, createUserSchema, updateUserSchema, paginationSchema }
