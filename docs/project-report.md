# Ocean View Resort – Project Report

## A. Project Overview

### 1) Project Title
Ocean View Resort – Hotel Reservation System

### 2) Problem Statement
Manual and partially digital reservation processes create frequent issues in hotel operations: booking conflicts, weak visibility of room availability, delayed check-in/check-out handling, and poor reporting. This project solves those issues with a role-based, web-based reservation platform for customers, reception staff, and administrators.

### 3) Objectives
- Provide a smooth online reservation process for customers.
- Give staff a centralized dashboard for reservation operations.
- Enforce secure role-based access using JWT and Spring Security.
- Reduce overbooking via date-overlap availability checks.
- Generate operational insights (reservation and revenue summaries).
- Support reliable delivery through unit tests, E2E tests, and CI checks.

### 4) Scope
- In scope: authentication, room browsing, reservation creation/cancellation, billing view, staff reservation management, room-type management, user management (admin), dashboard metrics, reports.
- Out of scope (current version): payment gateway integration, email/SMS notifications, third-party channel manager integration.

---

## B. Technology Stack

### 1) Frontend
- Next.js (`app` router), React, TypeScript
- Tailwind CSS + reusable UI components
- API client abstraction in `frontend/lib/api.ts`

### 2) Backend
- Spring Boot (Java 21)
- Spring Web, Spring Security, Spring Validation
- Spring Data MongoDB
- JWT authentication (`jjwt`)

### 3) Database
- MongoDB (collections: `users`, `reservations`, `room_types`)

### 4) DevOps / Tooling
- Docker Compose (`mongo`, `api`, `frontend`)
- Maven wrapper + npm
- GitHub Actions PR pipeline
- Playwright (E2E), Vitest (frontend unit), JUnit + Mockito (backend unit)

---

## C. System Users and Roles

### 1) Customer
- Register/Login
- Browse rooms and availability
- Create own reservations
- View reservation details and bill
- Cancel own booked reservations

### 2) Reception
- Access dashboard metrics and reports
- Manage reservations (create/update status)
- Access room-type management

### 3) Admin
- All reception capabilities
- User management (create/update role/delete)

Role model is implemented by `Role` enum (`ADMIN`, `RECEPTION`, `CUSTOMER`) and enforced in backend method-level authorization plus frontend guards.

---

## D. Functional Requirements

### 1) Authentication & Authorization
- User registration (`/api/auth/register`) creates `CUSTOMER` by default.
- User login (`/api/auth/login`) returns JWT token.
- JWT token stores username and role claims.
- Protected endpoints require valid bearer token.

### 2) Room Management
- Public users can list room types and details (`/api/rooms`, `/api/rooms/{roomType}`).
- Availability endpoint checks date-range inventory (`/api/rooms/{roomType}/availability`).
- Staff can update room details and images via multipart payload (`PUT /api/rooms/{roomType}`).

### 3) Reservation Management
- Customer reservation APIs under `/api/my/reservations`.
- Staff reservation APIs under `/api/reservations`.
- Reservation status lifecycle: `BOOKED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`.
- Reservation number generated as `RSV-XXXXXXXX`.

### 4) Billing and Reports
- Bill generation per reservation with room-type strategy.
- Dashboard metrics for total reservations, upcoming check-ins/check-outs, revenue in selected range.
- Reports for reservation distribution and revenue by room type.

### 5) User Management
- Admin-only user list/create/update-role/delete via `/api/users`.

---

## E. Non-Functional Requirements

- **Security:** JWT auth, BCrypt password hashing, role-based authorization.
- **Maintainability:** Layered architecture (controller/service/repository), DTO mapping, centralized exception handling.
- **Scalability:** MongoDB document model with indexed fields for key queries.
- **Usability:** Clean role-based UI with dedicated customer and staff flows.
- **Reliability:** Automated lint, unit, and E2E checks in local + CI.
- **Configurability:** Environment-driven runtime config (`api/.env`, `application.properties` placeholders).

---

## F. System Architecture

### 1) High-level Architecture
- **Client layer:** Next.js frontend.
- **API layer:** Spring Boot REST services.
- **Data layer:** MongoDB.
- **Infra:** Docker Compose for local orchestration.

### 2) Architectural Style
- Monorepo with separated `frontend/` and `api/` modules.
- Backend follows layered architecture and SOLID-friendly separation:
  - Controllers: transport/http concerns
  - Services: business logic
  - Repositories: persistence

### 3) Security Architecture
- Stateless session policy.
- JWT filter validates bearer token on each request.
- Method-level rules via `@PreAuthorize`.
- CORS restricted to frontend origin (`http://localhost:3000`).

---

## G. Database Design

### 1) Collections and Core Fields

#### `users`
- `id` (ObjectId/String)
- `username` (unique, indexed)
- `email` (unique, indexed)
- `passwordHash`
- `role` (`ADMIN` | `RECEPTION` | `CUSTOMER`)
- `createdAt`

#### `reservations`
- `id`
- `reservationNo` (unique, indexed)
- `customerId` (indexed; references `users.id` logically)
- `guestName`, `address`, `contactNo`
- `roomType` (indexed enum)
- `checkInDate`, `checkOutDate` (indexed)
- `status` (indexed enum)
- `createdAt`, `updatedAt`

#### `room_types`
- `id`
- `roomType` (unique enum)
- `name`, `description`
- `amenities[]`, `facilities[]`
- `imageUrls[]`
- `totalRooms`, `maxGuests`, `sizeSqm`, `bedType`, `ratePerNight`
- `createdAt`, `updatedAt`

### 2) Key Relationships
- One `User (CUSTOMER)` can own many `Reservations`.
- `Reservation.roomType` maps to one `RoomTypeDetails.roomType`.

### 3) Query/Index Notes
- Overlap query for availability excludes cancelled reservations.
- Date-window queries support dashboard and report metrics.

---

## H. API Design Summary

### 1) Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### 2) Public
- `GET /api/help`
- `GET /api/rooms`
- `GET /api/rooms/{roomType}`
- `GET /api/rooms/{roomType}/availability`

### 3) Customer
- `GET /api/my/reservations`
- `POST /api/my/reservations`
- `GET /api/my/reservations/{reservationNo}`
- `PATCH /api/my/reservations/{reservationNo}/cancel`
- `GET /api/my/reservations/{reservationNo}/bill`

### 4) Staff/Admin
- `GET /api/reservations`
- `POST /api/reservations`
- `GET /api/reservations/{reservationNo}`
- `PATCH /api/reservations/{reservationNo}/status`
- `GET /api/reservations/{reservationNo}/bill`
- `GET /api/dashboard/metrics`
- `GET /api/reports/reservations-summary`
- `GET /api/reports/revenue-summary`

### 5) Admin-only
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/{id}/role`
- `DELETE /api/users/{id}`

---

## I. Frontend Module Design

### 1) Public Pages
- Home: `frontend/app/page.tsx`
- Rooms list/detail: `frontend/app/rooms/**`
- Experiences/Contact/Help
- Login/Register

### 2) Customer Pages
- `frontend/app/my-reservations/page.tsx`
- `frontend/app/my-reservations/new/page.tsx`
- `frontend/app/my-reservations/[reservationNo]/page.tsx`
- `frontend/app/my-reservations/[reservationNo]/bill/page.tsx`

### 3) Staff/Admin Pages
- Dashboard: `frontend/app/dashboard/page.tsx`
- Reservations operations: `frontend/app/reservations/page.tsx`
- Reports: `frontend/app/reports/page.tsx`
- Room types management: `frontend/app/room-types/page.tsx`
- User management (admin): `frontend/app/users/page.tsx`

### 4) Shared Frontend Infrastructure
- API wrapper: `frontend/lib/api.ts`
- JWT/token helpers: `frontend/lib/auth.ts`
- Role guard hook: `frontend/lib/guard.ts`
- Type contracts: `frontend/lib/types.ts`

---

## J. Business Logic and Design Patterns

### 1) Reservation Validation Rules
- `checkOutDate` must be after `checkInDate`.
- Availability check compares overlapping active reservations against `totalRooms`.
- Customer can only read/cancel own reservations.

### 2) Billing Strategy Pattern
- `BillingStrategy` interface + concrete strategies:
  - `SingleBilling`, `DoubleBilling`, `DeluxeBilling`, `SuiteBilling`
- `BillingStrategyFactory` resolves strategy by room type.

### 3) Error Handling
- Domain exceptions (`ResourceNotFoundException`, `IllegalArgumentException`) are converted to API responses by `RestExceptionHandler`.

### 4) Seeding Strategy
- `DataSeeder` inserts initial users, room types, and sample reservations when enabled (`app.seed.enabled=true`).

---

## K. Testing and Quality Assurance

### 1) Frontend Unit Tests (Vitest)
- `frontend/lib/auth.test.ts`: token storage and JWT parsing.
- `frontend/lib/api.test.ts`: JSON/FormData request behavior.
- `frontend/lib/format.test.ts`: format helpers.

### 2) Backend Unit Tests (JUnit/Mockito)
- `api/src/test/.../ReservationServiceTest.java`
- Verifies availability failure and successful booking behavior.

### 3) E2E Tests (Playwright)
- `guest.spec.ts`: public browsing + registration.
- `customer.spec.ts`: customer reservation creation flow.
- `staff.spec.ts`: reception staff operations.
- `admin.spec.ts`: admin user lifecycle (create/delete).

### 4) CI Quality Gate
- Workflow: `.github/workflows/pr-quality.yml`
- Jobs:
  - Backend unit tests
  - Frontend lint + unit tests
  - Playwright E2E with service startup/wait checks

### 5) Local Test Command
- `make test` runs backend tests and frontend lint/unit tests.

---

## L. Deployment and Environment Configuration

### 1) Local Containerized Deployment
- `docker-compose.yml` defines:
  - `mongo`
  - `api` (uses `env_file: ./api/.env`)
  - `frontend`

### 2) Environment Variables (API)
- `SPRING_DATA_MONGODB_URI`
- `JWT_SECRET`
- `APP_SEED_ENABLED`
- `SEED_DEFAULT_PASSWORD`

### 3) Security Note
- Secrets are externalized via environment variables and should not be hardcoded in repository-tracked source.

---

## M. Required Diagrams (7) – What to Draw

Use these exact seven diagrams in your submission.

### Diagram 1: Use Case Diagram
- **Actors:** Guest, Customer, Reception, Admin.
- **Customer use cases:** Register, Login, Browse Rooms, Check Availability, Create Reservation, View Reservation, Cancel Reservation, View Bill.
- **Reception use cases:** Login, Create Reservation, Update Status, Manage Room Types, View Reports, View Dashboard.
- **Admin use cases:** All reception capabilities + Manage Users.

### Diagram 2: ER Diagram
- Entities: `User`, `Reservation`, `RoomTypeDetails`.
- Relationship: `User (1) -> (N) Reservation` via `customerId`.
- Reference relation: `Reservation.roomType` -> `RoomTypeDetails.roomType`.
- Mark unique fields: `users.username`, `users.email`, `reservations.reservationNo`, `room_types.roomType`.

### Diagram 3: Class Diagram (Backend Domain + Services)
- Include: `User`, `Reservation`, `RoomTypeDetails`, `ReservationService`, `UserService`, `RoomTypeDetailsService`, `BillingService`, `BillingStrategy`, `BillingStrategyFactory`.
- Show `BillingStrategy` interface and concrete strategy implementations.

### Diagram 4: Sequence Diagram – Customer Booking
- Flow: UI (`/rooms/{roomType}`) -> API availability endpoint -> availability response -> register/login if needed -> create reservation endpoint -> success redirect to `my-reservations`.

### Diagram 5: Sequence Diagram – Staff Reservation Status Update
- Flow: staff UI `/reservations` -> API get reservations -> select reservation -> PATCH status -> repository save -> refreshed list.

### Diagram 6: Activity Diagram – Reservation Lifecycle
- Start -> Enter details -> Validate dates -> Check availability -> [available?]
  - No -> show error
  - Yes -> create booking (`BOOKED`) -> optional transitions to `CHECKED_IN` -> `CHECKED_OUT` or `CANCELLED`.

### Diagram 7: Deployment Diagram
- Browser client -> Next.js frontend container/service (port 3000)
- Frontend -> Spring Boot API container/service (port 8080)
- API -> MongoDB container/service (port 27017)
- Optionally include GitHub Actions runner for CI test execution path.

---

## N. Screenshot Plan (You Add Actual Images)

Add screenshots in your final document/report at these points.

1. **Home page** (`/`)
2. **Rooms page** (`/rooms`)
3. **Room detail + booking form** (`/rooms/{roomType}`)
4. **Register page** and **Login page**
5. **Customer reservations list** (`/my-reservations`)
6. **New reservation form** (`/my-reservations/new`)
7. **Reservation detail + bill page**
8. **Staff dashboard** (`/dashboard`)
9. **Staff reservations management** (`/reservations`)
10. **Room type management** (`/room-types`)
11. **Reports page** (`/reports`)
12. **Admin user management** (`/users`)
13. **Docker containers running** (`docker compose ps`)
14. **CI workflow success** (GitHub Actions PR Quality Gate)
15. **Playwright report summary** (if generated)

Suggested screenshot naming:
- `01-home.png`, `02-rooms.png`, ..., `15-playwright-report.png`

---

## Appendix: Run Instructions

### Local development
- Backend: `cd api && ./mvnw spring-boot:run`
- Frontend: `cd frontend && npm install && npm run dev`

### Docker
- `docker compose up --build`

### Tests
- Unified local command: `make test`
- E2E only: `cd frontend && npm run test:e2e`

---

## Conclusion
The Ocean View Resort system delivers a full-stack, role-based reservation platform with clear separation of concerns, secure authentication, inventory-aware booking logic, and production-oriented quality controls (unit + E2E + CI). The current implementation is a strong baseline for future expansion into payments, notifications, and advanced analytics.
