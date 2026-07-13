# syntax=docker/dockerfile:1
# Minimal MVP API — no monorepo workspace deps

FROM node:20-slim
WORKDIR /app

COPY docker/package.json ./package.json
RUN npm install --omit=dev

COPY docker/server.mjs ./server.mjs
COPY docker/insights.mjs ./insights.mjs
COPY docker/prompts.mjs ./prompts.mjs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.mjs"]
