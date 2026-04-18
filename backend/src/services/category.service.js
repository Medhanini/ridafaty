'use strict'

const categoryRepository = require('../repositories/category.repository')
const { generateSlug, uniqueSlug } = require('../utils/slug')
const ApiError = require('../utils/ApiError')

class CategoryService {
  async getAll(query = {}) {
    const { lang, page = 1, limit = 20 } = query
    return categoryRepository.findAll({
      lang: lang || undefined,
      page: Number(page),
      limit: Number(limit),
    })
  }

  async getById(id) {
    const category = await categoryRepository.findById(id)
    if (!category) throw ApiError.notFound(`Category ${id} not found`)
    return category
  }

  async getBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug)
    if (!category) throw ApiError.notFound(`Category "${slug}" not found`)
    return category
  }

  async create({ name, lang }) {
    const base = generateSlug(name)
    const slug = await uniqueSlug(base, (s) => categoryRepository.findBySlug(s).then(Boolean))
    return categoryRepository.create({ name, slug, lang })
  }

  async update(id, dto) {
    await this.getById(id)

    let slug
    if (dto.name) {
      const base = generateSlug(dto.name)
      slug = await uniqueSlug(base, async (s) => {
        const existing = await categoryRepository.findBySlug(s)
        return existing && existing.id !== id
      })
    }

    return categoryRepository.update(id, { ...dto, ...(slug && { slug }) })
  }

  async delete(id) {
    await this.getById(id)
    return categoryRepository.delete(id)
  }
}

module.exports = new CategoryService()
