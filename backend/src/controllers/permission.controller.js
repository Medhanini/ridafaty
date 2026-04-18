'use strict'

const permissionService = require('../services/permission.service')

const PermissionController = {
  async getAll(_req, res, next) {
    try {
      const permissions = await permissionService.getAll()
      res.json({ success: true, data: permissions })
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const perm = await permissionService.getById(Number(req.params.id))
      res.json({ success: true, data: perm })
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const perm = await permissionService.create(req.body)
      res.status(201).json({ success: true, data: perm })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const perm = await permissionService.update(Number(req.params.id), req.body)
      res.json({ success: true, data: perm })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      await permissionService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}

module.exports = PermissionController
