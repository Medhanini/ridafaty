# =============================================================================
# Stage 1 – deps: install ALL dependencies (dev + prod)
# Prisma CLI lives in devDeps, so we need everything to run `prisma generate`.
# =============================================================================
FROM node:20-alpine AS deps

# OpenSSL is required by Prisma's query-engine binary on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

# Generate Prisma client in the deps stage so runner can copy the binary
COPY prisma ./prisma
RUN npx prisma generate

# =============================================================================
# Stage 2 – dev: hot-reload development server (target: dev)
# docker-compose mounts ./src and ./prisma as volumes for live reload.
# =============================================================================
FROM node:20-alpine AS dev

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client targeting Alpine (linux-musl-openssl-3.0.x)
RUN npx prisma generate

EXPOSE 3001

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# =============================================================================
# Stage 3 – prod-deps: only production dependencies
# =============================================================================
FROM node:20-alpine AS prod-deps

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile --omit=dev

# =============================================================================
# Stage 4 – runner: minimal production image
# =============================================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nodejs

WORKDIR /app

# Production node_modules (no devDeps)
COPY --from=prod-deps /app/node_modules ./node_modules

# Prisma generated client (architecture-specific binary built in deps stage)
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Application source
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs prisma ./prisma
COPY --chown=nodejs:nodejs docker-entrypoint.sh package.json ./

RUN chmod +x docker-entrypoint.sh

# Pre-create uploads dir so the volume mounts with correct ownership
RUN mkdir -p /app/uploads/images && chown -R nodejs:nodejs /app/uploads

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3001

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
