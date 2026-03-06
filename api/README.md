# Ocean View Resort API

Spring Boot + MongoDB backend for the Ocean View Resort Online Room Reservation System.

## Quick Start

```bash
./mvnw spring-boot:run
```

## Configuration

- `MONGODB_URI` (default: `mongodb://localhost:27017/ocean_view_resort`)
- `JWT_SECRET` (default: `change-this-secret`)
- `app.jwt.expiration` (milliseconds)

## Seed Data

On first run, the API seeds demo users and reservations.

- Admin: `admin` / `Password@123`
- Reception: `reception` / `Password@123`
- Customer: `customer` / `Password@123`

## Health

```bash
curl http://localhost:8080/api/help
```
