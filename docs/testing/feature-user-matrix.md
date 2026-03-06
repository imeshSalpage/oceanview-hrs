# Feature → User Matrix

## Roles
- **Guest**: Unauthenticated visitor
- **Customer**: Authenticated customer (`CUSTOMER`)
- **Reception**: Staff user (`RECEPTION`)
- **Admin**: Staff user (`ADMIN`)

## Features by Role

| Feature | Guest | Customer | Reception | Admin | Frontend Page(s) | API Endpoint(s) |
|---|---:|---:|---:|---:|---|---|
| View homepage | ✅ | ✅ | ✅ | ✅ | `/` | — |
| View rooms list/details | ✅ | ✅ | ✅ | ✅ | `/rooms`, `/rooms/[roomType]` | `GET /api/rooms`, `GET /api/rooms/{roomType}` |
| Check room availability | ✅ | ✅ | ✅ | ✅ | `/rooms/[roomType]` | `GET /api/rooms/{roomType}/availability` |
| View experiences/contact/help | ✅ | ✅ | ✅ | ✅ | `/experiences`, `/contact`, `/help` | `GET /api/help` |
| Register account | ✅ | — | — | — | `/register` | `POST /api/auth/register` |
| Login | ✅ | ✅ | ✅ | ✅ | `/login` | `POST /api/auth/login` |
| View own reservations | — | ✅ | — | — | `/my-reservations` | `GET /api/my/reservations` |
| Create own reservation | — | ✅ | — | — | `/my-reservations/new` | `POST /api/my/reservations` |
| View own reservation details | — | ✅ | — | — | `/my-reservations/[reservationNo]` | `GET /api/my/reservations/{reservationNo}` |
| View own bill | — | ✅ | — | — | `/my-reservations/[reservationNo]/bill` | `GET /api/my/reservations/{reservationNo}/bill` |
| Cancel own reservation | — | ✅ | — | — | `/my-reservations` | `PATCH /api/my/reservations/{reservationNo}/cancel` |
| Staff dashboard metrics | — | — | ✅ | ✅ | `/dashboard` | `GET /api/dashboard/metrics` |
| Staff reservations management | — | — | ✅ | ✅ | `/reservations` | `GET/POST /api/reservations`, `PATCH /api/reservations/{reservationNo}/status` |
| Staff billing access | — | — | ✅ | ✅ | `/reservations` actions | `GET /api/reservations/{reservationNo}/bill` |
| Reports and analytics | — | — | ✅ | ✅ | `/reports` | `GET /api/reports/reservations-summary`, `GET /api/reports/revenue-summary` |
| Manage room types (incl. image uploads) | — | — | ✅ | ✅ | `/room-types` | `GET /api/rooms/manage`, `PUT /api/rooms/{roomType}` |
| User management | — | — | — | ✅ | `/users` | `GET/POST /api/users`, `PATCH /api/users/{id}/role`, `DELETE /api/users/{id}` |

## Test Coverage Strategy
- **E2E (Playwright)**: Core role journeys (Guest, Customer, Reception, Admin)
- **Frontend unit tests (Vitest)**: `auth`, `api`, `format` helper logic
- **Backend unit tests (JUnit + Mockito)**: Reservation availability and creation behavior
- **PR pipeline (GitHub Actions)**: Lint + frontend unit + backend unit + full E2E
