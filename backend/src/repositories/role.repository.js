'use strict'

const { getPrismaClient } = require('../config/database')

const WITH_PERMISSIONS = {
  permissions: { include: { permission: true } },
  _count: { select: { users: true } },
}

class RoleRepository {
  get db() {
    return getPrismaClient().role
  }

  async findAll() {
    return this.db.findMany({ orderBy: { name: 'asc' }, include: WITH_PERMISSIONS })
  }

  async findById(id) {
    return this.db.findUnique({ where: { id }, include: WITH_PERMISSIONS })
  }

  async findByName(name) {
    return this.db.findUnique({ where: { name } })
  }

  async create(data) {
    return this.db.create({ data, include: WITH_PERMISSIONS })
  }

  async update(id, data) {
    return this.db.update({ where: { id }, data, include: WITH_PERMISSIONS })
  }

  async delete(id) {
    return this.db.delete({ where: { id } })
  }
}

module.exports = new RoleRepository()
