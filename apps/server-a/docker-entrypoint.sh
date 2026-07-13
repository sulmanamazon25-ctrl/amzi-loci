#!/bin/sh
set -e

echo "Running database migrations..."
for schema in ./node_modules/@amzi-loci/database/prisma/schema.prisma ./packages/database/prisma/schema.prisma; do
  if [ -f "$schema" ]; then
    npx prisma migrate deploy --schema="$schema" && break
  fi
done || echo "WARN: migrations skipped"

echo "Starting API server..."
exec node ./dist/index.js
