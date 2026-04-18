'use strict'

const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')

const MAX_RETRIES = 10
const RETRY_DELAY_MS = 3000

/**
 * Singleton Prisma client.
 * Re-use the same instance across the entire process (prevents connection pool exhaustion).
 */
let prisma

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    })

    // Forward Prisma events to Winston
    prisma.$on('error', (e) => logger.error('Prisma error', { message: e.message }))
    prisma.$on('warn', (e) => logger.warn('Prisma warning', { message: e.message }))
    // Uncomment for verbose SQL logging in dev:
    // prisma.$on('query', (e) => logger.debug('SQL', { query: e.query, duration: e.duration }))
  }
  return prisma
}

/**
 * Connects to the database with exponential-backoff retry logic.
 * Called once at server startup; safe to await before binding the HTTP port.
 */
async function connectWithRetry(attempt = 1) {
  const client = getPrismaClient()
  try {
    await client.$connect()
    logger.info('Database connected successfully')
    return client
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      logger.error(`Database connection failed after ${MAX_RETRIES} attempts`, {
        error: err.message,
      })
      throw err
    }

    const delay = RETRY_DELAY_MS * Math.min(attempt, 4) // cap at 4× base delay
    logger.warn(`Database not ready – retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return connectWithRetry(attempt + 1)
  }
}

/**
 * Gracefully disconnect Prisma (called in shutdown handler).
 */
async function disconnect() {
  if (prisma) {
    await prisma.$disconnect()
    logger.info('Database disconnected')
  }
}

module.exports = { getPrismaClient, connectWithRetry, disconnect }
