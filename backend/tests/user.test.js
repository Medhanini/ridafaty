'use strict'

const request = require('supertest')
const app = require('../src/app')

// ── Mock Prisma so tests never touch a real DB ────────────────────────────────
jest.mock('../src/config/database', () => ({
  getPrismaClient: () => ({
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $on: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }),
  connectWithRetry: jest.fn(),
  disconnect: jest.fn(),
}))

const { getPrismaClient } = require('../src/config/database')
const db = getPrismaClient()

// Helper: reset all mocks between tests
beforeEach(() => jest.clearAllMocks())

// ── Health check ──────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

// ── GET /api/users ────────────────────────────────────────────────────────────
describe('GET /api/users', () => {
  const mockUsers = [
    { id: 1, email: 'alice@example.com', name: 'Alice', role: 'USER' },
    { id: 2, email: 'bob@example.com', name: 'Bob', role: 'ADMIN' },
  ]

  it('returns a paginated list of users', async () => {
    db.user.findMany.mockResolvedValue(mockUsers)
    db.user.count.mockResolvedValue(2)

    const res = await request(app).get('/api/users')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.total).toBe(2)
  })
})

// ── GET /api/users/:id ────────────────────────────────────────────────────────
describe('GET /api/users/:id', () => {
  it('returns 200 when user exists', async () => {
    const user = { id: 1, email: 'alice@example.com', name: 'Alice', role: 'USER' }
    db.user.findUnique.mockResolvedValue(user)

    const res = await request(app).get('/api/users/1')

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('alice@example.com')
  })

  it('returns 404 when user does not exist', async () => {
    db.user.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/users/999')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

// ── POST /api/users ───────────────────────────────────────────────────────────
describe('POST /api/users', () => {
  it('creates a user and returns 201', async () => {
    const payload = { email: 'new@example.com', name: 'New User' }
    const created = { id: 3, ...payload, role: 'USER' }

    db.user.findUnique.mockResolvedValue(null) // no conflict
    db.user.create.mockResolvedValue(created)

    const res = await request(app).post('/api/users').send(payload)

    expect(res.status).toBe(201)
    expect(res.body.data.id).toBe(3)
  })

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/users').send({ name: 'No Email' })
    expect(res.status).toBe(400)
  })

  it('returns 409 when email is already taken', async () => {
    db.user.findUnique.mockResolvedValue({ id: 1, email: 'taken@example.com' })

    const res = await request(app)
      .post('/api/users')
      .send({ email: 'taken@example.com', name: 'Dup' })

    expect(res.status).toBe(409)
  })
})

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
describe('DELETE /api/users/:id', () => {
  it('returns 204 on success', async () => {
    const user = { id: 1, email: 'alice@example.com', name: 'Alice' }
    db.user.findUnique.mockResolvedValue(user)
    db.user.delete.mockResolvedValue(user)

    const res = await request(app).delete('/api/users/1')
    expect(res.status).toBe(204)
  })

  it('returns 404 when user does not exist', async () => {
    db.user.findUnique.mockResolvedValue(null)

    const res = await request(app).delete('/api/users/999')
    expect(res.status).toBe(404)
  })
})

// ── 404 fallback ──────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for unknown paths', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
  })
})
