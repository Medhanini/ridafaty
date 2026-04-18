'use strict'

const articleRepository     = require('../repositories/article.repository')
const subcategoryRepository = require('../repositories/subcategory.repository')
const tagRepository         = require('../repositories/tag.repository')
const mediaRepository       = require('../repositories/media.repository')
const { generateSlug, uniqueSlug } = require('../utils/slug')
const ApiError = require('../utils/ApiError')

class ArticleService {
  async getAll(query = {}) {
    const { lang, subCategoryId, categoryId, userId, page = 1, limit = 20 } = query
    return articleRepository.findAll({
      lang:          lang          || undefined,
      subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
      categoryId:    categoryId    ? Number(categoryId)    : undefined,
      userId:        userId        ? Number(userId)        : undefined,
      page:  Number(page),
      limit: Number(limit),
    })
  }

  async getById(id) {
    const article = await articleRepository.findById(id)
    if (!article) throw ApiError.notFound(`Article ${id} not found`)
    return article
  }

  async getBySlug(slug) {
    const article = await articleRepository.findBySlug(slug)
    if (!article) throw ApiError.notFound(`Article "${slug}" not found`)
    return article
  }

  async create({ title, content, excerpt, lang, userId, subCategoryId, tagIds = [], mediaIds = [] }) {
    // Validate sub-category
    const sub = await subcategoryRepository.findById(subCategoryId)
    if (!sub) throw ApiError.badRequest(`SubCategory ${subCategoryId} not found`)

    // Validate tags
    if (tagIds.length) {
      const found = await tagRepository.findManyByIds(tagIds)
      if (found.length !== tagIds.length) throw ApiError.badRequest('One or more tag IDs are invalid')
    }

    // Validate media
    if (mediaIds.length) {
      const found = await mediaRepository.findManyByIds(mediaIds)
      if (found.length !== mediaIds.length) throw ApiError.badRequest('One or more media IDs are invalid')
    }

    const base = generateSlug(title)
    const slug = await uniqueSlug(base, (s) => articleRepository.findBySlug(s).then(Boolean))

    return articleRepository.create({ title, slug, content, excerpt, lang, userId, subCategoryId, tagIds, mediaIds })
  }

  async update(id, dto) {
    await this.getById(id)

    const { tagIds, mediaIds, ...fields } = dto

    if (fields.subCategoryId) {
      const sub = await subcategoryRepository.findById(fields.subCategoryId)
      if (!sub) throw ApiError.badRequest(`SubCategory ${fields.subCategoryId} not found`)
    }

    if (tagIds !== undefined && tagIds.length) {
      const found = await tagRepository.findManyByIds(tagIds)
      if (found.length !== tagIds.length) throw ApiError.badRequest('One or more tag IDs are invalid')
    }

    if (mediaIds !== undefined && mediaIds.length) {
      const found = await mediaRepository.findManyByIds(mediaIds)
      if (found.length !== mediaIds.length) throw ApiError.badRequest('One or more media IDs are invalid')
    }

    let slug
    if (fields.title) {
      const base = generateSlug(fields.title)
      slug = await uniqueSlug(base, async (s) => {
        const existing = await articleRepository.findBySlug(s)
        return existing && existing.id !== id
      })
    }

    return articleRepository.update(id, { ...fields, ...(slug && { slug }), tagIds, mediaIds })
  }

  async delete(id) {
    await this.getById(id)
    return articleRepository.delete(id)
  }
}

module.exports = new ArticleService()
