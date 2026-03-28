api-dev:
	cd api && ./mvnw spring-boot:run

api-test:
	docker run --rm -v "$(PWD)/api":/workspace -v "$(HOME)/.m2":/root/.m2 -w /workspace maven:3.9.6-eclipse-temurin-21 mvn test

frontend-dev:
	cd frontend && npm run dev

frontend-lint:
	cd frontend && npm run lint

frontend-test:
	cd frontend && npm run test:unit

test:
	$(MAKE) api-test
	$(MAKE) frontend-lint
	$(MAKE) frontend-test

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
