'use strict'

const path    = require('path')
const express = require('express')
const helmet  = require('helmet')
const cors    = require('cors')
const morgan  = require('morgan')

const env = require('./config/env')
const routes = require('./routes')
const notFoundMiddleware = require('./middlewares/notFound.middleware')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

// ── Request logging ───────────────────────────────────────────────────────────
// Use 'combined' in production (includes IP, user-agent); 'dev' otherwise
app.use(morgan(env.isProd ? 'combined' : 'dev'))

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Uploaded media files ──────────────────────────────────────────────────────
// Served at /uploads/images/<filename>  (e.g. /uploads/images/1234-abc.jpg)
// Cross-Origin-Resource-Policy must be 'cross-origin' so browsers on a
// different origin (localhost:3000) can load these images.
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(path.join(process.cwd(), 'uploads')))

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFoundMiddleware)

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorMiddleware)

module.exports = app
