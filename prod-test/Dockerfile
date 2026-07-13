# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/server-a ./apps/server-a
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @amzi-loci/server-a... build
RUN pnpm deploy --filter @amzi-loci/server-a --prod /prod/server-a

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /prod/server-a ./
COPY --from=builder /app/apps/server-a/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

RUN chmod +x /app/docker-entrypoint.sh

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
