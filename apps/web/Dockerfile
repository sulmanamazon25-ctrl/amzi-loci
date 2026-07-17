# syntax=docker/dockerfile:1
# Marketing site — static SPA via nginx

FROM node:20-slim AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter @amzi-loci/web --filter @amzi-loci/shared

COPY apps/web ./apps/web

RUN pnpm --filter @amzi-loci/shared build && pnpm --filter @amzi-loci/web build

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
