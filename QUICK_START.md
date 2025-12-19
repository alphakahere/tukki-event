# 🚀 Quick Start Guide - Tukki Event

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- npm 9+ installed

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Docker Services (PostgreSQL + Redis)

```bash
npm run docker:up
```

Wait for services to be healthy (about 10-15 seconds).

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed
```

### 4. Start API Server

```bash
npm run dev:api
```

## 🎉 You're Ready!

The API is now running at:

- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

## Test the API

### 1. Register a new user

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `accessToken` from the response.

### 3. Get your profile

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Pre-seeded Test Accounts

The database is seeded with these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@tukki.com | admin123 |
| Organizer | organizer@tukki.com | organizer123 |
| User | user@tukki.com | user123 |

## Useful Commands

```bash
# View API logs
npm run dev:api

# View Docker logs
docker-compose logs -f

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Stop Docker services
npm run docker:down
```

## Next Steps

1. ✅ Explore the API with Swagger UI: http://localhost:3000/api/docs
2. ✅ Check the database with Prisma Studio: `npm run prisma:studio`
3. ✅ Review the README.md for detailed documentation
4. ✅ Start building Organizations module (Phase 2)

## Troubleshooting

### Port already in use

If port 3000, 5432, or 6379 is already in use:

```bash
# Stop Docker services
npm run docker:down

# Change ports in docker-compose.yml or .env
```

### Database connection error

Make sure Docker services are running:

```bash
docker-compose ps
```

All services should show "Up" status.

### Prisma Client not found

```bash
npm run prisma:generate
```

---

**Happy coding! 🎉**
