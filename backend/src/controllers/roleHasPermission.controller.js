'use strict'

const roleService = require('../services/role.service')

/**
 * Manages the many-to-many relationship between Roles and Permissions.
 *
 * POST   /roles/:id/permissions          – assign one or more permissions
 * DELETE /roles/:id/permissions/:permId  – revoke a single permission
 * PUT    /roles/:id/permissions          – full sync (replace all permissions)
 */
const RoleHasPermissionController = {
  /** POST /roles/:id/permissions  body: { permissionIds: [1,2,3] } */
  async assign(req, res, next) {
    try {
      const roleId = Number(req.params.id)
      const { permissionIds } = req.body

      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        return res.status(400).json({ success: false, error: { status: 400, message: 'permissionIds must be a non-empty array' } })
      }

      const role = await roleService.assignPermissions(roleId, permissionIds)
      res.json({ success: true, data: role })
    } catch (err) {
      next(err)
    }
  },

  /** DELETE /roles/:id/permissions/:permId */
  async revoke(req, res, next) {
    try {
      const roleId = Number(req.params.id)
      const permissionId = Number(req.params.permId)
      const role = await roleService.revokePermission(roleId, permissionId)
      res.json({ success: true, data: role })
    } catch (err) {
      next(err)
    }
  },

  /** PUT /roles/:id/permissions  body: { permissionIds: [1,2] } – replaces all */
  async sync(req, res, next) {
    try {
      const roleId = Number(req.params.id)
      const { permissionIds } = req.body

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ success: false, error: { status: 400, message: 'permissionIds must be an array' } })
      }

      const role = await roleService.syncPermissions(roleId, permissionIds)
      res.json({ success: true, data: role })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = RoleHasPermissionController
