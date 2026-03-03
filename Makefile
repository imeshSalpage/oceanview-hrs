api-dev:
	cd api && ./mvnw spring-boot:run

api-test:
	cd api && ./mvnw test

frontend-dev:
	cd frontend && npm run dev

frontend-lint:
	cd frontend && npm run lint

up:
	docker compose up --build

down:
	docker compose down
