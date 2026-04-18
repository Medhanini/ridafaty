'use strict'

require('dotenv').config()

const REQUIRED = ['DATABASE_URL', 'NODE_ENV', 'JWT_SECRET']

const missing = REQUIRED.filter((key) => !process.env[key])
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  HOST: process.env.HOST ?? '0.0.0.0',

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',

  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),

  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((s) => s.trim()),

  LOG_LEVEL: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  SEED_DB: process.env.SEED_DB === 'true',

  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
}

module.exports = env
