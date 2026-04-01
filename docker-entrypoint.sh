#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."

# Wait for database to be ready
until nc -z barberflow-db 5432 2>/dev/null; do
  sleep 1
done

echo "✅ PostgreSQL is ready"

# Run database migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting BarberFlow..."
exec node server.js
