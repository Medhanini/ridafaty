'use strict'

const { getPrismaClient } = require('../config/database')

class MediaRepository {
  get db() { return getPrismaClient() }

  async findAll({ type, page = 1, limit = 20 } = {}) {
    const where = type ? { type } : {}
    const skip  = (page - 1) * limit

    const [data, total] = await this.db.$transaction([
      this.db.media.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.media.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findById(id) {
    return this.db.media.findUnique({ where: { id } })
  }

  async findManyByIds(ids) {
    return this.db.media.findMany({ where: { id: { in: ids } } })
  }

  async create(data) {
    return this.db.media.create({ data })
  }

  async update(id, data) {
    return this.db.media.update({ where: { id }, data })
  }

  async delete(id) {
    return this.db.media.delete({ where: { id } })
  }
}

module.exports = new MediaRepository()
