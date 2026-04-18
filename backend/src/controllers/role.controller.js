'use strict'

const roleService = require('../services/role.service')

const RoleController = {
  async getAll(_req, res, next) {
    try {
      const roles = await roleService.getAll()
      res.json({ success: true, data: roles })
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const role = await roleService.getById(Number(req.params.id))
      res.json({ success: true, data: role })
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const role = await roleService.create(req.body)
      res.status(201).json({ success: true, data: role })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const role = await roleService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: role })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      await roleService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}

module.exports = RoleController
