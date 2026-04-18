'use strict'

const tagService = require('../services/tag.service')

const TagController = {
  async getAll(req, res, next) {
    try {
      const result = await tagService.getAll(req.query)
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  },

  async getById(req, res, next) {
    try {
      const tag = await tagService.getById(Number(req.params.id))
      res.json({ success: true, data: tag })
    } catch (err) { next(err) }
  },

  async create(req, res, next) {
    try {
      const tag = await tagService.create(req.body)
      res.status(201).json({ success: true, data: tag })
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const tag = await tagService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: tag })
    } catch (err) { next(err) }
  },

  async delete(req, res, next) {
    try {
      await tagService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) { next(err) }
  },
}

module.exports = TagController
