'use strict'

const tagRepository = require('../repositories/tag.repository')
const { generateSlug, uniqueSlug } = require('../utils/slug')
const ApiError = require('../utils/ApiError')

class TagService {
  async getAll(query = {}) {
    const { lang, page = 1, limit = 20 } = query
    return tagRepository.findAll({
      lang: lang || undefined,
      page:  Number(page),
      limit: Number(limit),
    })
  }

  async getById(id) {
    const tag = await tagRepository.findById(id)
    if (!tag) throw ApiError.notFound(`Tag ${id} not found`)
    return tag
  }

  async create({ name, lang }) {
    const base = generateSlug(name)
    const slug = await uniqueSlug(base, (s) => tagRepository.findBySlug(s).then(Boolean))
    return tagRepository.create({ name, slug, lang })
  }

  async update(id, dto) {
    await this.getById(id)

    let slug
    if (dto.name) {
      const base = generateSlug(dto.name)
      slug = await uniqueSlug(base, async (s) => {
        const existing = await tagRepository.findBySlug(s)
        return existing && existing.id !== id
      })
    }

    return tagRepository.update(id, { ...dto, ...(slug && { slug }) })
  }

  async delete(id) {
    await this.getById(id)
    return tagRepository.delete(id)
  }
}

module.exports = new TagService()
