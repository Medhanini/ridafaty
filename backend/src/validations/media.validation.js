'use strict'

const Joi = require('joi')

const TYPES = ['image', 'video']

// ── Common ────────────────────────────────────────────────────────────────────

const idParam = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
})

// ── List ──────────────────────────────────────────────────────────────────────

const listSchema = Joi.object({
  query: Joi.object({
    type:  Joi.string().valid(...TYPES).optional(),
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
})

// ── Create video (URL only – images go through POST /upload) ──────────────────

const createSchema = Joi.object({
  body: Joi.object({
    url:  Joi.string().uri().max(1000).required(),
    type: Joi.string().valid('video').required(),
    alt:  Joi.string().max(255).optional().allow('', null),
  }),
})

// ── Image upload (multipart) ──────────────────────────────────────────────────
// Only validates the optional text fields; the file is validated by multer.

const uploadSchema = Joi.object({
  body: Joi.object({
    alt: Joi.string().max(255).optional().allow('', null),
  }),
})

// ── Re-upload image for an existing record ────────────────────────────────────

const reuploadSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    alt: Joi.string().max(255).optional().allow('', null),
  }),
})

// ── Update ────────────────────────────────────────────────────────────────────

const updateSchema = Joi.object({
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    url:  Joi.string().uri().max(1000).optional(),
    type: Joi.string().valid(...TYPES).optional(),
    alt:  Joi.string().max(255).optional().allow('', null),
  }).min(1),
})

module.exports = { idParam, listSchema, createSchema, uploadSchema, reuploadSchema, updateSchema }
