'use strict'

const { getPrismaClient } = require('../config/database')

const include = {
  category: { select: { id: true, name: true, slug: true, lang: true } },
  _count: { select: { articles: true } },
}

class SubCategoryRepository {
  get db() { return getPrismaClient() }

  async findAll({ lang, categoryId, page = 1, limit = 20 } = {}) {
    const where = {}
    if (lang)       where.lang = lang
    if (categoryId) where.categoryId = categoryId
    const skip = (page - 1) * limit

    const [data, total] = await this.db.$transaction([
      this.db.subCategory.findMany({ where, include, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.subCategory.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findById(id) {
    return this.db.subCategory.findUnique({ where: { id }, include })
  }

  async findBySlug(slug) {
    return this.db.subCategory.findUnique({ where: { slug }, include })
  }

  async create(data) {
    return this.db.subCategory.create({ data, include })
  }

  async update(id, data) {
    return this.db.subCategory.update({ where: { id }, data, include })
  }

  async delete(id) {
    return this.db.subCategory.delete({ where: { id } })
  }
}

module.exports = new SubCategoryRepository()
