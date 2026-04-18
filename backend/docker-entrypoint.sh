#!/bin/sh
set -e

echo "▶ Running Prisma migrations…"
npx prisma migrate deploy

echo "▶ Running database seeder…"
node src/seeders/index.js

echo "▶ Starting server…"
exec "$@"
