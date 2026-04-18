'use strict'

const categoryService = require('../services/category.service')

const CategoryController = {
  async getAll(req, res, next) {
    try {
      const result = await categoryService.getAll(req.query)
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  },

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(Number(req.params.id))
      res.json({ success: true, data: category })
    } catch (err) { next(err) }
  },

  async getBySlug(req, res, next) {
    try {
      const category = await categoryService.getBySlug(req.params.slug)
      res.json({ success: true, data: category })
    } catch (err) { next(err) }
  },

  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body)
      res.status(201).json({ success: true, data: category })
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const category = await categoryService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: category })
    } catch (err) { next(err) }
  },

  async delete(req, res, next) {
    try {
      await categoryService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) { next(err) }
  },
}

module.exports = CategoryController
