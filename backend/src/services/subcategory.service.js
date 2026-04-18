'use strict'

const subcategoryRepository = require('../repositories/subcategory.repository')
const categoryRepository    = require('../repositories/category.repository')
const { generateSlug, uniqueSlug } = require('../utils/slug')
const ApiError = require('../utils/ApiError')

class SubCategoryService {
  async getAll(query = {}) {
    const { lang, categoryId, page = 1, limit = 20 } = query
    return subcategoryRepository.findAll({
      lang:       lang       ? lang              : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page:  Number(page),
      limit: Number(limit),
    })
  }

  async getById(id) {
    const sub = await subcategoryRepository.findById(id)
    if (!sub) throw ApiError.notFound(`SubCategory ${id} not found`)
    return sub
  }

  async getBySlug(slug) {
    const sub = await subcategoryRepository.findBySlug(slug)
    if (!sub) throw ApiError.notFound(`SubCategory "${slug}" not found`)
    return sub
  }

  async create({ name, lang, categoryId }) {
    // Validate parent category exists
    const category = await categoryRepository.findById(categoryId)
    if (!category) throw ApiError.badRequest(`Category ${categoryId} not found`)

    const base = generateSlug(name)
    const slug = await uniqueSlug(base, (s) => subcategoryRepository.findBySlug(s).then(Boolean))
    return subcategoryRepository.create({ name, slug, lang, categoryId })
  }

  async update(id, dto) {
    await this.getById(id)

    if (dto.categoryId) {
      const category = await categoryRepository.findById(dto.categoryId)
      if (!category) throw ApiError.badRequest(`Category ${dto.categoryId} not found`)
    }

    let slug
    if (dto.name) {
      const base = generateSlug(dto.name)
      slug = await uniqueSlug(base, async (s) => {
        const existing = await subcategoryRepository.findBySlug(s)
        return existing && existing.id !== id
      })
    }

    return subcategoryRepository.update(id, { ...dto, ...(slug && { slug }) })
  }

  async delete(id) {
    await this.getById(id)
    return subcategoryRepository.delete(id)
  }
}

module.exports = new SubCategoryService()
