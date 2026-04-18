'use strict'

const { getPrismaClient } = require('../config/database')

class ProfileRepository {
  get db() {
    return getPrismaClient().profile
  }

  async findAll() {
    return this.db.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, email: true, name: true } } } })
  }

  async findById(id) {
    return this.db.findUnique({ where: { id }, include: { user: { select: { id: true, email: true, name: true } } } })
  }

  async findByUserId(userId) {
    return this.db.findUnique({ where: { userId }, include: { user: { select: { id: true, email: true, name: true } } } })
  }

  async create(data) {
    return this.db.create({ data })
  }

  async update(id, data) {
    return this.db.update({ where: { id }, data })
  }

  async updateByUserId(userId, data) {
    return this.db.update({ where: { userId }, data })
  }

  async delete(id) {
    return this.db.delete({ where: { id } })
  }
}

module.exports = new ProfileRepository()
