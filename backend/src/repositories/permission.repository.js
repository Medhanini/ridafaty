'use strict'

const { getPrismaClient } = require('../config/database')

class PermissionRepository {
  get db() {
    return getPrismaClient().permission
  }

  async findAll() {
    return this.db.findMany({ orderBy: { name: 'asc' } })
  }

  async findById(id) {
    return this.db.findUnique({ where: { id } })
  }

  async findByName(name) {
    return this.db.findUnique({ where: { name } })
  }

  async findManyByIds(ids) {
    return this.db.findMany({ where: { id: { in: ids } } })
  }

  async create(data) {
    return this.db.create({ data })
  }

  async update(id, data) {
    return this.db.update({ where: { id }, data })
  }

  async delete(id) {
    return this.db.delete({ where: { id } })
  }
}

module.exports = new PermissionRepository()
