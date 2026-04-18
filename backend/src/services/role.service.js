'use strict'

const roleRepository = require('../repositories/role.repository')
const permissionRepository = require('../repositories/permission.repository')
const { getPrismaClient } = require('../config/database')
const ApiError = require('../utils/ApiError')

class RoleService {
  async getAll() {
    return roleRepository.findAll()
  }

  async getById(id) {
    const role = await roleRepository.findById(id)
    if (!role) throw ApiError.notFound(`Role ${id} not found`)
    return role
  }

  async create({ name, description }) {
    const existing = await roleRepository.findByName(name)
    if (existing) throw ApiError.conflict(`Role "${name}" already exists`)
    return roleRepository.create({ name, description })
  }

  async update(id, dto) {
    await this.getById(id)
    if (dto.name) {
      const existing = await roleRepository.findByName(dto.name)
      if (existing && existing.id !== id) {
        throw ApiError.conflict(`Role name "${dto.name}" is already taken`)
      }
    }
    return roleRepository.update(id, dto)
  }

  async delete(id) {
    await this.getById(id)
    return roleRepository.delete(id)
  }

  // ── Permission assignment ─────────────────────────────────────────────────

  async assignPermissions(roleId, permissionIds) {
    await this.getById(roleId)

    const found = await permissionRepository.findManyByIds(permissionIds)
    if (found.length !== permissionIds.length) {
      throw ApiError.badRequest('One or more permission IDs are invalid')
    }

    const db = getPrismaClient()
    // Upsert each permission assignment (idempotent)
    const ops = permissionIds.map((permissionId) =>
      db.roleHasPermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        create: { roleId, permissionId },
        update: {},
      }),
    )
    await db.$transaction(ops)
    return roleRepository.findById(roleId)
  }

  async revokePermission(roleId, permissionId) {
    await this.getById(roleId)
    const db = getPrismaClient()
    await db.roleHasPermission.deleteMany({ where: { roleId, permissionId } })
    return roleRepository.findById(roleId)
  }

  async syncPermissions(roleId, permissionIds) {
    await this.getById(roleId)
    const db = getPrismaClient()
    await db.$transaction([
      db.roleHasPermission.deleteMany({ where: { roleId } }),
      ...permissionIds.map((permissionId) =>
        db.roleHasPermission.create({ data: { roleId, permissionId } }),
      ),
    ])
    return roleRepository.findById(roleId)
  }
}

module.exports = new RoleService()
