# End-to-End + Unit Test Plan

## 1) Environment assumptions
- Backend runs on `http://localhost:8080`
- Frontend runs on `http://localhost:3000`
- Seed users exist (from `DataSeeder`):
  - `admin / Password@123`
  - `reception / Password@123`
  - `customer / Password@123`

## 2) Step-by-step implementation plan
1. Build role-feature matrix from real routes/controllers.
2. Add frontend unit test framework (`Vitest`) and tests for utility modules.
3. Add Playwright E2E setup and role-based end-to-end suites.
4. Add backend unit tests (`JUnit + Mockito`) for reservation business rules.
5. Add PR GitHub Actions to run lint + unit + E2E automatically.
6. Validate locally and in CI.

## 3) E2E scenarios
### Guest
- Open home page and verify hero text.
- Navigate to Rooms, Experiences, Contact, Help.
- Register a brand new customer and verify redirect to My Reservations.

### Customer
- Login as seeded customer.
- Open My Reservations.
- Create a new reservation.
- Open reservation details and bill page.

### Reception (Staff)
- Login as reception.
- Open Dashboard, Reservations, Reports, Room Types.
- Create a reservation from staff panel and verify listing.

### Admin
- Login as admin.
- Open Users page.
- Create a user and delete that user.

## 4) Unit test scope
### Frontend (`Vitest`)
- `auth.ts`: token get/set/clear, JWT parse, role/username extraction.
- `api.ts`: JSON vs FormData behavior and error parsing.
- `format.ts`: date/currency formatting smoke checks.

### Backend (`JUnit`)
- `ReservationService`:
  - rejects reservation when availability is full.
  - creates reservation when availability exists.

## 5) CI quality gate on PR
- Trigger on all PRs.
- Jobs:
  1. Backend unit tests (`mvn test`).
  2. Frontend lint + unit (`eslint`, `vitest`).
  3. E2E browser tests (start API + frontend, run Playwright).
