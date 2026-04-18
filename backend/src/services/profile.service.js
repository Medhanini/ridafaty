'use strict'

const profileRepository = require('../repositories/profile.repository')
const ApiError = require('../utils/ApiError')

class ProfileService {
  async getAll() {
    return profileRepository.findAll()
  }

  async getById(id) {
    const profile = await profileRepository.findById(id)
    if (!profile) throw ApiError.notFound(`Profile ${id} not found`)
    return profile
  }

  async getByUserId(userId) {
    const profile = await profileRepository.findByUserId(userId)
    if (!profile) throw ApiError.notFound(`Profile for user ${userId} not found`)
    return profile
  }

  /**
   * Users can only update their own profile unless they are admin.
   * Pass `isAdmin=true` to bypass the ownership check.
   */
  async update(id, dto, { requesterId, isAdmin = false } = {}) {
    const profile = await this.getById(id)

    if (!isAdmin && profile.userId !== requesterId) {
      throw ApiError.forbidden('You can only update your own profile')
    }

    return profileRepository.update(id, dto)
  }

  async delete(id) {
    await this.getById(id)
    return profileRepository.delete(id)
  }
}

module.exports = new ProfileService()
