'use strict'

const bcrypt = require('bcryptjs')
const userRepository = require('../repositories/user.repository')
const roleRepository = require('../repositories/role.repository')
const profileRepository = require('../repositories/profile.repository')
const { signToken } = require('../config/jwt')
const ApiError = require('../utils/ApiError')
const env = require('../config/env')

class AuthService {
  /**
   * Register a new user.
   * - Hashes the password with bcrypt
   * - Assigns the default 'user' role if none provided
   * - Creates an empty profile automatically
   * @returns {{ user, token }}
   */
  async register({ name, email, password, roleId }) {
    const existing = await userRepository.findByEmail(email)
    if (existing) throw ApiError.conflict(`Email "${email}" is already registered`)

    // Default to the 'user' role if no roleId is provided
    let targetRoleId = roleId ?? null
    if (!targetRoleId) {
      const defaultRole = await roleRepository.findByName('user')
      if (defaultRole) targetRoleId = defaultRole.id
    }

    const hashed = await bcrypt.hash(password, env.BCRYPT_ROUNDS)

    const user = await userRepository.create({
      name,
      email,
      password: hashed,
      ...(targetRoleId && { roleId: targetRoleId }),
    })

    // Auto-create an empty profile for the new user
    await profileRepository.create({ userId: user.id })

    const token = signToken(user.id)
    return { user, token }
  }

  /**
   * Authenticate a user and return a JWT.
   * @returns {{ user, token }}
   */
  async login({ email, password }) {
    // Use the password-bearing query (not the public select)
    const user = await userRepository.findByEmail(email)
    if (!user) throw ApiError.unauthorized('Invalid email or password')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw ApiError.unauthorized('Invalid email or password')

    // Return the public view (no password field)
    const publicUser = await userRepository.findById(user.id)
    const token = signToken(user.id)
    return { user: publicUser, token }
  }

  /** Return the caller's own profile from req.user (already loaded by auth middleware) */
  async me(userId) {
    return userRepository.findById(userId)
  }
}

module.exports = new AuthService()
