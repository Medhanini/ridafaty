'use strict'

const permissionRepository = require('../repositories/permission.repository')
const ApiError = require('../utils/ApiError')

class PermissionService {
  async getAll() {
    return permissionRepository.findAll()
  }

  async getById(id) {
    const perm = await permissionRepository.findById(id)
    if (!perm) throw ApiError.notFound(`Permission ${id} not found`)
    return perm
  }

  async create({ name, description }) {
    const existing = await permissionRepository.findByName(name)
    if (existing) throw ApiError.conflict(`Permission "${name}" already exists`)
    return permissionRepository.create({ name, description })
  }

  async update(id, dto) {
    await this.getById(id)
    if (dto.name) {
      const existing = await permissionRepository.findByName(dto.name)
      if (existing && existing.id !== id) {
        throw ApiError.conflict(`Permission name "${dto.name}" is already taken`)
      }
    }
    return permissionRepository.update(id, dto)
  }

  async delete(id) {
    await this.getById(id)
    return permissionRepository.delete(id)
  }
}

module.exports = new PermissionService()
