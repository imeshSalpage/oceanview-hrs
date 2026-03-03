Ocean View Resort frontend built with Next.js and Tailwind CSS.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The frontend expects a running Spring Boot API.

## Environment

Set the API base URL if needed:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Pages

- Public: `/`, `/login`, `/register`, `/help`
- Customer: `/my-reservations`, `/my-reservations/new`, `/my-reservations/[reservationNo]`, `/my-reservations/[reservationNo]/bill`
- Staff: `/dashboard`, `/reservations`, `/reports`
- Admin: `/users`

## Build

```bash
npm run build
```
