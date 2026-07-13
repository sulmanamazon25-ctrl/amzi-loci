#!/bin/sh

echo "Running database migrations..."
if [ -f ./packages/database/prisma/schema.prisma ]; then
  npx prisma migrate deploy --schema=./packages/database/prisma/schema.prisma || echo "WARN: migrations skipped"
fi

echo "Starting API server..."
exec node ./dist/index.js
