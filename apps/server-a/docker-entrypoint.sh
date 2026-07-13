#!/bin/sh
set -e

echo "Running database migrations..."
if [ -f /app/packages/database/prisma/schema.prisma ]; then
  npx prisma migrate deploy --schema=/app/packages/database/prisma/schema.prisma
else
  echo "WARN: Prisma schema not found, skipping migrations"
fi

echo "Starting API server..."
exec node /app/dist/index.js
