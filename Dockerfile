# syntax=docker/dockerfile:1
# Coolify: build from repo root with Dockerfile at /

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/server-a ./apps/server-a
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @amzi-loci/shared build \
 && pnpm --filter @amzi-loci/database generate \
 && pnpm --filter @amzi-loci/database build \
 && pnpm --filter @amzi-loci/server-a build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/apps/server-a/dist ./dist
COPY --from=builder /app/apps/server-a/package.json ./package.json
COPY --from=builder /app/apps/server-a/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/database/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/packages/database/node_modules/prisma ./node_modules/prisma

RUN chmod +x /app/docker-entrypoint.sh

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
