'use strict'

const subcategoryService = require('../services/subcategory.service')

const SubCategoryController = {
  async getAll(req, res, next) {
    try {
      const result = await subcategoryService.getAll(req.query)
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  },

  async getById(req, res, next) {
    try {
      const sub = await subcategoryService.getById(Number(req.params.id))
      res.json({ success: true, data: sub })
    } catch (err) { next(err) }
  },

  async getBySlug(req, res, next) {
    try {
      const sub = await subcategoryService.getBySlug(req.params.slug)
      res.json({ success: true, data: sub })
    } catch (err) { next(err) }
  },

  async create(req, res, next) {
    try {
      const sub = await subcategoryService.create(req.body)
      res.status(201).json({ success: true, data: sub })
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const sub = await subcategoryService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: sub })
    } catch (err) { next(err) }
  },

  async delete(req, res, next) {
    try {
      await subcategoryService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) { next(err) }
  },
}

module.exports = SubCategoryController
