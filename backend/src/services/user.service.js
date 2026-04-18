'use strict'

const bcrypt = require('bcryptjs')
const userRepository = require('../repositories/user.repository')
const roleRepository = require('../repositories/role.repository')
const ApiError = require('../utils/ApiError')
const env = require('../config/env')

class UserService {
  async getAll(query) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
    return userRepository.findAll({ page, limit })
  }

  async getById(id) {
    const user = await userRepository.findById(id)
    if (!user) throw ApiError.notFound(`User ${id} not found`)
    return user
  }

  async create({ name, email, password, roleId }) {
    if (!email || !name || !password) {
      throw ApiError.badRequest('name, email, and password are required')
    }

    const existing = await userRepository.findByEmail(email)
    if (existing) throw ApiError.conflict(`Email "${email}" is already registered`)

    if (roleId) {
      const role = await roleRepository.findById(roleId)
      if (!role) throw ApiError.badRequest(`Role ${roleId} not found`)
    }

    const hashed = await bcrypt.hash(password, env.BCRYPT_ROUNDS)
    return userRepository.create({ name, email, password: hashed, roleId: roleId ?? null })
  }

  async update(id, dto) {
    await this.getById(id)

    if (dto.email) {
      const existing = await userRepository.findByEmail(dto.email)
      if (existing && existing.id !== id) {
        throw ApiError.conflict(`Email "${dto.email}" is already taken`)
      }
    }

    if (dto.roleId) {
      const role = await roleRepository.findById(dto.roleId)
      if (!role) throw ApiError.badRequest(`Role ${dto.roleId} not found`)
    }

    const data = { ...dto }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS)
    }

    return userRepository.update(id, data)
  }

  async delete(id) {
    await this.getById(id)
    await userRepository.delete(id)
  }
}

module.exports = new UserService()
