'use strict'

const jwt = require('jsonwebtoken')
const env = require('./env')

/**
 * Sign a JWT for a given userId.
 * @param {number} userId
 * @returns {string} signed token
 */
function signToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  })
}

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError / TokenExpiredError on invalid / expired tokens.
 * @param {string} token
 * @returns {{ sub: number, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] })
}

module.exports = { signToken, verifyToken }
