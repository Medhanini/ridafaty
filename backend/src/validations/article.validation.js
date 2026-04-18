'use strict'

const Joi = require('joi')

const LANGS = ['fr', 'en', 'ar']

const idParam = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
})

const listSchema = Joi.object({
  query: Joi.object({
    lang:          Joi.string().valid(...LANGS).optional(),
    subCategoryId: Joi.number().integer().positive().optional(),
    categoryId:    Joi.number().integer().positive().optional(),
    userId:        Joi.number().integer().positive().optional(),
    page:          Joi.number().integer().min(1).default(1),
    limit:         Joi.number().integer().min(1).max(100).default(20),
  }),
})

const createSchema = Joi.object({
  body: Joi.object({
    title:         Joi.string().min(3).max(300).required(),
    content:       Joi.string().min(1).required(),
    excerpt:       Joi.string().max(1000).optional().allow('', null),
    lang:          Joi.string().valid(...LANGS).required(),
    subCategoryId: Joi.number().integer().positive().required(),
    tagIds:        Joi.array().items(Joi.number().integer().positive()).default([]),
    mediaIds:      Joi.array().items(Joi.number().integer().positive()).default([]),
  }),
})

const updateSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    title:         Joi.string().min(3).max(300).optional(),
    content:       Joi.string().min(1).optional(),
    excerpt:       Joi.string().max(1000).optional().allow('', null),
    lang:          Joi.string().valid(...LANGS).optional(),
    subCategoryId: Joi.number().integer().positive().optional(),
    tagIds:        Joi.array().items(Joi.number().integer().positive()).optional(),
    mediaIds:      Joi.array().items(Joi.number().integer().positive()).optional(),
  }).min(1),
})

module.exports = { idParam, listSchema, createSchema, updateSchema }
