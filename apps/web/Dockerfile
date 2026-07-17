# syntax=docker/dockerfile:1
# Marketing site - static SPA via nginx

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Installers: use local public/downloads if present, else GitHub Release assets
ARG APP_VERSION=0.11.0
ARG RELEASE_TAG=v0.11.0
RUN apk add --no-cache curl && mkdir -p apps/web/public/downloads && \
    if [ ! -f apps/web/public/downloads/Amzi-Loci-${APP_VERSION}-setup.exe ]; then \
      curl -fsSL -o apps/web/public/downloads/Amzi-Loci-${APP_VERSION}-setup.exe \
        https://github.com/sulmanamazon25-ctrl/amzi-loci/releases/download/${RELEASE_TAG}/Amzi-Loci-${APP_VERSION}-setup.exe; \
      curl -fsSL -o apps/web/public/downloads/Amzi-Loci-${APP_VERSION}.msi \
        https://github.com/sulmanamazon25-ctrl/amzi-loci/releases/download/${RELEASE_TAG}/Amzi-Loci-${APP_VERSION}.msi; \
      curl -fsSL -o apps/web/public/downloads/Amzi-Loci-${APP_VERSION}-portable.exe \
        https://github.com/sulmanamazon25-ctrl/amzi-loci/releases/download/${RELEASE_TAG}/Amzi-Loci-${APP_VERSION}-portable.exe; \
    fi

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @amzi-loci/web... build

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
