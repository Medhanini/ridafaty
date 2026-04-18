'use strict'

const http = require('http')
const app = require('./app')
const env = require('./config/env')
const { connectWithRetry, disconnect } = require('./config/database')
const logger = require('./utils/logger')

const server = http.createServer(app)

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`${signal} received – shutting down gracefully…`)

  server.close(async () => {
    logger.info('HTTP server closed')
    await disconnect()
    logger.info('Shutdown complete')
    process.exit(0)
  })

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Crash on unhandled promise rejections (Node ≥ 15 behaviour)
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason })
  shutdown('unhandledRejection')
})

// ── Boot sequence ─────────────────────────────────────────────────────────────
async function start() {
  try {
    // 1. Wait for the database (retries internally)
    await connectWithRetry()

    // 2. Bind the HTTP port
    server.listen(env.PORT, env.HOST, () => {
      logger.info(`Server running on http://${env.HOST}:${env.PORT} [${env.NODE_ENV}]`)
    })
  } catch (err) {
    logger.error('Failed to start server', { error: err.message })
    process.exit(1)
  }
}

start()
