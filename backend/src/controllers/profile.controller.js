'use strict'

const profileService = require('../services/profile.service')

const ProfileController = {
  async getAll(_req, res, next) {
    try {
      const profiles = await profileService.getAll()
      res.json({ success: true, data: profiles })
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const profile = await profileService.getById(Number(req.params.id))
      res.json({ success: true, data: profile })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const isAdmin = req.user?.role?.name === 'admin'
      const profile = await profileService.update(Number(req.params.id), req.body, {
        requesterId: req.user?.id,
        isAdmin,
      })
      res.json({ success: true, data: profile })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      await profileService.delete(Number(req.params.id))
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}

module.exports = ProfileController
