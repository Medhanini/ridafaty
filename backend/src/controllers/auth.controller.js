'use strict'

const authService = require('../services/auth.service')

const AuthController = {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body)
      res.status(201).json({ success: true, data: { user, token } })
    } catch (err) {
      next(err)
    }
  },

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body)
      res.json({ success: true, data: { user, token } })
    } catch (err) {
      next(err)
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.me(req.user.id)
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = AuthController
