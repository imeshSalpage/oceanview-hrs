# Ocean View Resort Frontend

Production-style frontend for the **Ocean View Resort Hotel Reservation System**, built with **Next.js + TypeScript + Tailwind CSS**.

This app provides:
- Public room discovery and resort content
- Customer booking and reservation self-service
- Staff operational dashboard and reservation handling
- Admin user management

---

## 1) Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS + reusable UI components
- **Icons:** `lucide-react`
- **PDF Generation:** `jspdf`
- **Testing:** Vitest (unit), Playwright (E2E)

---

## 2) Prerequisites

- Node.js 20+
- npm 10+
- Running backend API (Spring Boot) at `http://localhost:8080` (default)

---

## 3) Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API expected at: `http://localhost:8080`

---

## 4) Environment Configuration

Use this variable to point frontend API calls to your backend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

You can set it in your shell before starting dev server, or pass it when running with Docker/build.

---

## 5) Available Scripts

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run start          # Run production build
npm run lint           # ESLint checks
npm run test:unit      # Vitest unit tests
npm run test:unit:watch
npm run test:e2e       # Playwright E2E
npm run test:e2e:headed
npm run test:all       # lint + unit + e2e
```

---

## 6) Frontend Route Map

### Public
- `/`
- `/rooms`
- `/rooms/[roomType]`
- `/experiences`
- `/contact`
- `/help`
- `/login`
- `/register`

### Customer
- `/my-reservations`
- `/my-reservations/new`
- `/my-reservations/[reservationNo]`
- `/my-reservations/[reservationNo]/bill`

### Staff (`RECEPTION` / `ADMIN`)
- `/dashboard`
- `/reservations`
- `/reports`
- `/room-types`

### Admin only
- `/users`

---

## 7) Authentication & Access Control

- JWT token is stored in browser local storage.
- Role is derived from JWT claims on client side.
- Route-level guard hook enforces allowed roles in protected pages.
- Backend still remains source of truth for authorization.

Key files:
- `lib/auth.ts`
- `lib/guard.ts`
- `lib/api.ts`

---

## 8) Project Structure (Frontend)

```text
frontend/
	app/                    # Next.js pages/routes
	components/             # shared UI and layout components
	lib/                    # api client, auth, guards, types, utils
	tests/e2e/              # Playwright E2E specs
	public/                 # static assets
	playwright.config.ts
	vitest.config.ts
```

---

## 9) API Integration Notes

- API wrapper automatically adds `Authorization: Bearer <token>` when available.
- JSON body requests use `Content-Type: application/json`.
- `FormData` requests (e.g., room image upload) are sent without forcing JSON headers.

---

## 10) Testing Guide

### Unit tests

```bash
npm run test:unit
```

### E2E tests

Install browsers first (one-time):

```bash
npx playwright install --with-deps chromium
```

Then run:

```bash
npm run test:e2e
```

---

## 11) Build & Production Run

```bash
npm run build
npm run start
```

---

## 12) Docker / Full Stack (Recommended for end-to-end flow)

From project root:

```bash
docker compose up --build
```

This starts:
- MongoDB
- Spring Boot API
- Next.js frontend

---

## 12.1) Docker Dev Environment (Hot Reload)

For day-to-day development with live reload in both frontend and backend:

From project root:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Or with make:

```bash
make up-dev
```

Useful companion commands:

```bash
make logs-dev
make down-dev
```

Notes:
- Backend runs with `mvn spring-boot:run` inside container.
- Frontend runs with `next dev` on `0.0.0.0:3000`.
- Source directories are bind-mounted for instant code reflection.

---

## 13) Documentation Links

Yes — it is absolutely okay (and recommended) to link sub-pages/docs for clarity.

Useful project docs:
- Full project report: [`../docs/project-report.md`](../docs/project-report.md)
- Testing plan: [`../docs/testing/test-plan.md`](../docs/testing/test-plan.md)
- Feature-user matrix: [`../docs/testing/feature-user-matrix.md`](../docs/testing/feature-user-matrix.md)

---

## 14) Troubleshooting

- **Frontend cannot reach backend:** verify `NEXT_PUBLIC_API_BASE_URL` and backend is running.
- **Unauthorized errors:** clear token by logging out and log in again.
- **Playwright failures:** ensure both API and frontend are running and seeded test users are available.
- **Port conflicts:** check ports `3000`, `8080`, and `27017` are free.

---

## 15) Contributing Notes

- Keep UI and business-access logic separated (components vs `lib/guard.ts`/API layer).
- Prefer typed request/response contracts in `lib/types.ts`.
- Add/update tests for user-facing behavior changes.
- Use small, focused commits.
