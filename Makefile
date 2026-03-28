api-dev:
	cd api && ./mvnw spring-boot:run

api-test:
	cd api && ./mvnw test

frontend-dev:
	cd frontend && npm run dev

frontend-lint:
	cd frontend && npm run lint

test:
	cd api && ./mvnw test
	cd frontend && npm run lint && npm run test:unit

up:
	docker compose up --build -d

down:
	docker compose down

up-dev:
	docker compose -f docker-compose.dev.yml up --build -d

down-dev:
	docker compose -f docker-compose.dev.yml down

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f
