# =============================================================================
# Stage 1 – deps: install production + dev dependencies with cache mount
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package.json (not package-lock.json — the lock contains Windows-specific
# native binding resolutions that break on Alpine/musl Linux inside Docker)
COPY package.json ./

RUN npm install

# =============================================================================
# Stage 2 – builder: compile the Nuxt SSR bundle
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Re-use the installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env vars can be injected here if needed:
# ARG NUXT_PUBLIC_API_BASE
# ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

RUN npm run build

# =============================================================================
# Stage 3 – runner: lightweight production image
# =============================================================================
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup --system --gid 1001 nuxtjs \
 && adduser  --system --uid 1001 nuxtjs

WORKDIR /app

# Only copy the built output; no source or dev deps needed at runtime
COPY --from=builder --chown=nuxtjs:nuxtjs /app/.output ./

USER nuxtjs

# Nuxt SSR server (Nitro) listens on 3000 by default
EXPOSE 3000

# Runtime secrets / config are injected via env vars, e.g.:
#   docker run -e NUXT_API_SECRET=xxx -e NUXT_PUBLIC_API_BASE=https://... ...
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

CMD ["node", "server/index.mjs"]
