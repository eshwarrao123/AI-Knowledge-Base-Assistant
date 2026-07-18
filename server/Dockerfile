# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production=false

COPY src ./src

RUN npm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy production deps manifest then install (no devDeps)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output and static assets
COPY --from=builder /app/dist ./dist

# Ensure uploads directory exists (real deployments should use cloud storage)
RUN mkdir -p uploads

EXPOSE ${PORT:-5000}

# Healthcheck via /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1

CMD ["node", "dist/index.js"]
