# syntax=docker/dockerfile:1

FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/server-a ./apps/server-a
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @amzi-loci/server-a... build

FROM node:20-slim AS runner
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/server-a/dist ./dist
COPY --from=builder /app/apps/server-a/package.json ./package.json
COPY --from=builder /app/apps/server-a/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
