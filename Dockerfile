# syntax=docker/dockerfile:1.7

# ---------- deps ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# better-sqlite3 needs a toolchain to build its native binding from source.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

# ---------- builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# A dummy secret keeps `next build` happy; the real one is supplied at runtime.
ENV SESSION_SECRET=build_time_placeholder_secret_at_least_32_chars
RUN npm run build

# ---------- runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/data/amethyst.db

# Standalone server, static assets, and public folder.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Persisted state: SQLite DB at /data, uploaded images at /app/public/uploads.
RUN mkdir -p /data /app/public/uploads \
    && chown -R nextjs:nodejs /data /app/public/uploads

USER nextjs
EXPOSE 3000
VOLUME ["/data", "/app/public/uploads"]

CMD ["node", "server.js"]
