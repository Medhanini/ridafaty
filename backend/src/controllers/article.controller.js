'use strict'

const articleService = require('../services/article.service')

const ArticleController = {
  async getAll(req, res, next) {
    try {
      const result = await articleService.getAll(req.query)
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  },

  async getById(req, res, next) {
    try {
      const article = await articleService.getById(Number(req.params.id))
      res.json({ success: true, data: article })
    } catch (err) { next(err) }
  },

  async getBySlug(req, res, next) {
    try {
      const article = await articleService.getBySlug(req.params.slug)
      res.json({ success: true, data: article })
    } catch (err) { next(err) }
  },

  async create(req, res, next) {
    try {
      // Attach the authenticated user as the author
      const article = await articleService.create({ ...req.body, userId: req.user.id })
      res.status(201).json({ success: true, data: article })
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const article = await articleService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: article })
    } catch (err) { next(err) }
  },

  async delete(req, res, next) {
    try {
      await articleService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) { next(err) }
  },
}

module.exports = ArticleController
