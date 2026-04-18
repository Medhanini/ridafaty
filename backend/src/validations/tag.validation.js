'use strict'

const Joi = require('joi')

const LANGS = ['fr', 'en', 'ar']

const idParam = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
})

const listSchema = Joi.object({
  query: Joi.object({
    lang:  Joi.string().valid(...LANGS).optional(),
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
})

const createSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    lang: Joi.string().valid(...LANGS).required(),
  }),
})

const updateSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    lang: Joi.string().valid(...LANGS).optional(),
  }).min(1),
})

module.exports = { idParam, listSchema, createSchema, updateSchema }
