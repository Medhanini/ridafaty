'use strict'

const { getPrismaClient } = require('../config/database')

const include = {
  _count: { select: { subCategories: true } },
}

class CategoryRepository {
  get db() { return getPrismaClient() }

  async findAll({ lang, page = 1, limit = 20 } = {}) {
    const where = lang ? { lang } : {}
    const skip  = (page - 1) * limit

    const [data, total] = await this.db.$transaction([
      this.db.category.findMany({ where, include, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.category.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findById(id) {
    return this.db.category.findUnique({
      where: { id },
      include: { subCategories: true, _count: { select: { subCategories: true } } },
    })
  }

  async findBySlug(slug) {
    return this.db.category.findUnique({
      where: { slug },
      include: {
        subCategories: {
          include: { _count: { select: { articles: true } } },
          orderBy: { name: 'asc' },
        },
        _count: { select: { subCategories: true } },
      },
    })
  }

  async create(data) {
    return this.db.category.create({ data, include })
  }

  async update(id, data) {
    return this.db.category.update({ where: { id }, data, include })
  }

  async delete(id) {
    return this.db.category.delete({ where: { id } })
  }
}

module.exports = new CategoryRepository()
