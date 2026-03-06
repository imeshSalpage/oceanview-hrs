# Ocean View Resort – Hotel Reservation System

Full-stack hotel reservation platform with role-based access for **customers**, **reception staff**, and **admins**.

## Overview
- **Frontend:** Next.js + TypeScript + Tailwind (`frontend/`)
- **Backend:** Spring Boot + Spring Security + JWT + MongoDB (`api/`)
- **Database:** MongoDB
- **Testing:** Vitest, Playwright, JUnit/Mockito
- **CI:** GitHub Actions PR quality gate

## Repository Structure
```text
hotel-project/
  api/                     # Spring Boot API
  frontend/                # Next.js frontend
  docs/                    # project docs/report/testing artifacts
  docker-compose.yml       # production-style compose
  docker-compose.dev.yml   # development compose (hot reload)
  Makefile                 # helper commands
```

## Quick Start (Docker Dev Environment)
Recommended for day-to-day development (hot reload enabled).

```bash
docker compose -f docker-compose.dev.yml up --build
```

or

```bash
make up-dev
```

Services:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- MongoDB: `localhost:27017`

Stop:

```bash
make down-dev
```

Logs:

```bash
make logs-dev
```

## Alternative: Standard Compose
Runs the image-based stack from Dockerfiles.

```bash
docker compose up --build
```

or

```bash
make up
```

## Local (Non-Docker) Development
### Backend
```bash
cd api
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing
### Unified local test command
```bash
make test
```

### Frontend E2E (Playwright)
```bash
cd frontend
npx playwright install --with-deps chromium
npm run test:e2e
```

### Backend unit tests
```bash
cd api
./mvnw test
```

## Environment Notes
Backend uses env-driven configuration (`api/.env` in compose setup):
- `SPRING_DATA_MONGODB_URI`
- `JWT_SECRET`
- `APP_SEED_ENABLED`
- `SEED_DEFAULT_PASSWORD`

Frontend base API URL:
- `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8080`)

## Key Features
- JWT authentication and role-based authorization
- Room browsing and availability checks
- Customer reservation creation/cancellation
- Billing generation by room type strategy
- Staff dashboard and reporting
- Admin user management

## Documentation
- Frontend guide: [`frontend/README.md`](frontend/README.md)
- API base notes: [`api/HELP.md`](api/HELP.md)
- Full project report: [`docs/project-report.md`](docs/project-report.md)
- Testing plan: [`docs/testing/test-plan.md`](docs/testing/test-plan.md)
- Feature-user matrix: [`docs/testing/feature-user-matrix.md`](docs/testing/feature-user-matrix.md)

## CI
PR quality workflow is in:
- [`.github/workflows/pr-quality.yml`](.github/workflows/pr-quality.yml)

It runs backend tests, frontend lint/unit checks, and Playwright E2E.
