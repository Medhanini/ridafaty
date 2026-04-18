'use strict'

const { getPrismaClient } = require('../config/database')

const include = {
  user:        { select: { id: true, name: true, email: true } },
  subCategory: {
    include: { category: { select: { id: true, name: true, slug: true } } },
  },
  tags:  { include: { tag: true } },
  media: { include: { media: true } },
}

class ArticleRepository {
  get db() { return getPrismaClient() }

  async findAll({ lang, subCategoryId, categoryId, userId, page = 1, limit = 20 } = {}) {
    const where = {}
    if (lang)          where.lang = lang
    if (subCategoryId) where.subCategoryId = subCategoryId
    if (categoryId)    where.subCategory = { categoryId }
    if (userId)        where.userId = userId
    const skip = (page - 1) * limit

    const [data, total] = await this.db.$transaction([
      this.db.article.findMany({ where, include, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.article.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findById(id) {
    return this.db.article.findUnique({ where: { id }, include })
  }

  async findBySlug(slug) {
    return this.db.article.findUnique({ where: { slug }, include })
  }

  async create({ tagIds = [], mediaIds = [], ...data }) {
    return this.db.article.create({
      data: {
        ...data,
        tags:  tagIds.length  ? { create: tagIds.map((tagId)   => ({ tagId }))   } : undefined,
        media: mediaIds.length ? { create: mediaIds.map((mediaId) => ({ mediaId })) } : undefined,
      },
      include,
    })
  }

  async update(id, { tagIds, mediaIds, ...data }) {
    return this.db.$transaction(async (tx) => {
      // Update scalar fields
      const updated = await tx.article.update({ where: { id }, data, include })

      // Sync tags if provided
      if (tagIds !== undefined) {
        await tx.articleTag.deleteMany({ where: { articleId: id } })
        if (tagIds.length) {
          await tx.articleTag.createMany({
            data: tagIds.map((tagId) => ({ articleId: id, tagId })),
          })
        }
      }

      // Sync media if provided
      if (mediaIds !== undefined) {
        await tx.articleMedia.deleteMany({ where: { articleId: id } })
        if (mediaIds.length) {
          await tx.articleMedia.createMany({
            data: mediaIds.map((mediaId) => ({ articleId: id, mediaId })),
          })
        }
      }

      // Re-fetch with fresh relations
      return tx.article.findUnique({ where: { id }, include })
    })
  }

  async delete(id) {
    return this.db.article.delete({ where: { id } })
  }
}

module.exports = new ArticleRepository()
