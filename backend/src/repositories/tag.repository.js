'use strict'

const { getPrismaClient } = require('../config/database')

const include = {
  _count: { select: { articles: true } },
}

class TagRepository {
  get db() { return getPrismaClient() }

  async findAll({ lang, page = 1, limit = 20 } = {}) {
    const where = lang ? { lang } : {}
    const skip  = (page - 1) * limit

    const [data, total] = await this.db.$transaction([
      this.db.tag.findMany({ where, include, skip, take: limit, orderBy: { name: 'asc' } }),
      this.db.tag.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findById(id) {
    return this.db.tag.findUnique({ where: { id }, include })
  }

  async findBySlug(slug) {
    return this.db.tag.findUnique({ where: { slug } })
  }

  async findManyByIds(ids) {
    return this.db.tag.findMany({ where: { id: { in: ids } } })
  }

  async create(data) {
    return this.db.tag.create({ data, include })
  }

  async update(id, data) {
    return this.db.tag.update({ where: { id }, data, include })
  }

  async delete(id) {
    return this.db.tag.delete({ where: { id } })
  }
}

module.exports = new TagRepository()
