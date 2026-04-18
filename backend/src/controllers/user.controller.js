'use strict'

const userService = require('../services/user.service')

const UserController = {
  async getAll(req, res, next) {
    try {
      const result = await userService.getAll(req.query)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.getById(Number(req.params.id))
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body)
      res.status(201).json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      await userService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}

module.exports = UserController
