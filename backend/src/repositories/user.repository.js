'use strict'

const { getPrismaClient } = require('../config/database')

// Reusable include – always embed role + its permissions, plus profile
const WITH_RELATIONS = {
  role: { include: { permissions: { include: { permission: true } } } },
  profile: true,
}

// Fields returned to API consumers (never expose password)
const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
  role: { include: { permissions: { include: { permission: true } } } },
  profile: true,
}

class UserRepository {
  get db() {
    return getPrismaClient().user
  }

  async findAll({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.db.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: PUBLIC_SELECT }),
      this.db.count(),
    ])
    return { data, total, page, limit }
  }

  async findById(id) {
    return this.db.findUnique({ where: { id }, select: PUBLIC_SELECT })
  }

  /** Returns the full user record (including hashed password) – for auth only */
  async findByIdWithPassword(id) {
    return this.db.findUnique({ where: { id }, include: WITH_RELATIONS })
  }

  async findByEmail(email) {
    return this.db.findUnique({ where: { email } })
  }

  /** Returns user with role+permissions loaded – for auth middleware */
  async findByEmailWithRelations(email) {
    return this.db.findUnique({ where: { email }, include: WITH_RELATIONS })
  }

  async create(data) {
    return this.db.create({ data, select: PUBLIC_SELECT })
  }

  async update(id, data) {
    return this.db.update({ where: { id }, data, select: PUBLIC_SELECT })
  }

  async delete(id) {
    return this.db.delete({ where: { id } })
  }
}

module.exports = new UserRepository()
