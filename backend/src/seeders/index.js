'use strict'

require('dotenv').config()

const bcrypt = require('bcryptjs')
const { getPrismaClient, connectWithRetry, disconnect } = require('../config/database')

// ── Seed data ─────────────────────────────────────────────────────────────────

const ROLES = [
  { name: 'admin', description: 'Full system access' },
  { name: 'moderator', description: 'Can manage content and users' },
  { name: 'user', description: 'Standard user access' },
]

const PERMISSIONS = [
  // Users
  { name: 'users:read',   description: 'View users' },
  { name: 'users:create', description: 'Create users' },
  { name: 'users:update', description: 'Update users' },
  { name: 'users:delete', description: 'Delete users' },
  // Roles
  { name: 'roles:read',   description: 'View roles' },
  { name: 'roles:create', description: 'Create roles' },
  { name: 'roles:update', description: 'Update roles & assign permissions' },
  { name: 'roles:delete', description: 'Delete roles' },
  // Permissions
  { name: 'permissions:read',   description: 'View permissions' },
  { name: 'permissions:create', description: 'Create permissions' },
  { name: 'permissions:update', description: 'Update permissions' },
  { name: 'permissions:delete', description: 'Delete permissions' },
  // Profiles
  { name: 'profiles:read',   description: 'View profiles' },
  { name: 'profiles:update', description: 'Update profiles' },
  { name: 'profiles:delete', description: 'Delete profiles' },
  // CMS – Categories
  { name: 'categories:create', description: 'Create categories' },
  { name: 'categories:update', description: 'Update categories' },
  { name: 'categories:delete', description: 'Delete categories' },
  // CMS – SubCategories
  { name: 'subcategories:create', description: 'Create sub-categories' },
  { name: 'subcategories:update', description: 'Update sub-categories' },
  { name: 'subcategories:delete', description: 'Delete sub-categories' },
  // CMS – Tags
  { name: 'tags:create', description: 'Create tags' },
  { name: 'tags:update', description: 'Update tags' },
  { name: 'tags:delete', description: 'Delete tags' },
  // CMS – Media
  { name: 'media:read',   description: 'View media library' },
  { name: 'media:create', description: 'Upload media' },
  { name: 'media:update', description: 'Update media metadata' },
  { name: 'media:delete', description: 'Delete media' },
  // CMS – Articles
  { name: 'articles:create', description: 'Create articles' },
  { name: 'articles:update', description: 'Update articles' },
  { name: 'articles:delete', description: 'Delete articles' },
]

// Permissions assigned per role
const ROLE_PERMISSIONS = {
  admin: PERMISSIONS.map((p) => p.name), // all
  moderator: [
    'users:read', 'users:update',
    'profiles:read', 'profiles:update',
    'categories:create', 'categories:update',
    'subcategories:create', 'subcategories:update',
    'tags:create', 'tags:update',
    'media:read', 'media:create', 'media:update',
    'articles:create', 'articles:update',
  ],
  user: [
    'users:read',
    'profiles:read', 'profiles:update',
    'media:read',
    'articles:create',
  ],
}

const ADMIN_USER = {
  name: 'Admin',
  email: 'admin@ridafaty.com',
  password: 'Admin@1234',
}

// ── Seed runner ───────────────────────────────────────────────────────────────

async function seed() {
  const db = getPrismaClient()

  // Idempotency check – skip if already seeded
  const existingAdmin = await db.role.findUnique({ where: { name: 'admin' } })
  if (existingAdmin) {
    console.log('⏭  Database already seeded – skipping')
    return
  }

  console.log('🌱 Seeding database…')

  // 1. Create roles
  const roleMap = {}
  for (const role of ROLES) {
    roleMap[role.name] = await db.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }
  console.log(`   ✔ ${ROLES.length} roles created`)

  // 2. Create permissions
  const permMap = {}
  for (const perm of PERMISSIONS) {
    permMap[perm.name] = await db.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
  }
  console.log(`   ✔ ${PERMISSIONS.length} permissions created`)

  // 3. Assign permissions to roles
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap[roleName]
    for (const permName of permNames) {
      const perm = permMap[permName]
      await db.roleHasPermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      })
    }
  }
  console.log('   ✔ Permissions assigned to roles')

  // 4. Create default admin user
  const hashed = await bcrypt.hash(ADMIN_USER.password, 12)
  const adminUser = await db.user.upsert({
    where: { email: ADMIN_USER.email },
    update: {},
    create: {
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: hashed,
      roleId: roleMap['admin'].id,
    },
  })

  // 5. Create admin's profile
  await db.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, firstName: 'Admin', lastName: 'User' },
  })
  console.log(`   ✔ Admin user created (${ADMIN_USER.email} / ${ADMIN_USER.password})`)

  console.log('✅ Seeding complete')
}

// ── Entry point (can also be imported and called directly) ─────────────────────
async function run() {
  try {
    await connectWithRetry()
    await seed()
  } catch (err) {
    console.error('❌ Seeder failed:', err.message)
    process.exit(1)
  } finally {
    await disconnect()
  }
}

// Run if called directly: node src/seeders/index.js
if (require.main === module) {
  run()
}

module.exports = { seed }
