FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
RUN npm ci --workspace=backend --workspace=shared

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY tsconfig.base.json ./
RUN npm run build --workspace=backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 lexstudy

COPY --from=builder --chown=lexstudy:nodejs /app/backend/dist ./dist
COPY --from=deps --chown=lexstudy:nodejs /app/node_modules ./node_modules

USER lexstudy
EXPOSE 3000
CMD ["node", "dist/server.js"]
