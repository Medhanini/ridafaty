'use strict'

const { createLogger, format, transports } = require('winston')
const env = require('../config/env')

const { combine, timestamp, colorize, printf, json, errors } = format

// Human-readable format for development
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${ts} [${level}] ${stack ?? message}${metaStr}`
  }),
)

// Structured JSON format for production (log aggregators, ELK, Datadog, etc.)
const prodFormat = combine(timestamp(), errors({ stack: true }), json())

const logger = createLogger({
  level: env.LOG_LEVEL,
  format: env.isProd ? prodFormat : devFormat,
  transports: [new transports.Console()],
  // Silence logs during tests
  silent: env.isTest,
})

module.exports = logger
