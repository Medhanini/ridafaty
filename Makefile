.PHONY: up down build logs ps restart \
        migrate migrate-dev studio \
        test lint format shell-backend shell-mysql

# ── Docker Compose ────────────────────────────────────────────────────────────
up:
	docker compose up --build

up-d:
	docker compose up --build -d

down:
	docker compose down

down-v:
	docker compose down -v          ## also removes named volumes (wipes DB)

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

ps:
	docker compose ps

restart:
	docker compose restart

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	docker compose exec backend npx prisma migrate deploy

migrate-dev:
	docker compose exec backend npx prisma migrate dev

studio:
	docker compose exec backend npx prisma studio

# ── Tests & quality ───────────────────────────────────────────────────────────
test:
	cd backend && npm test

lint:
	cd backend && npm run lint

format:
	cd backend && npm run format

# ── Shells ────────────────────────────────────────────────────────────────────
shell-backend:
	docker compose exec backend sh

shell-mysql:
	docker compose exec mysql mysql -u ridafaty -psecret ridafaty
