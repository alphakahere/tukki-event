# Tukki Event - Event Management Platform

A modern event management platform built with NestJS backend and Next.js frontend.

## Overview

Tukki Event is a comprehensive web platform designed for event organizers to create, manage, and promote events while allowing participants to discover, register, and purchase tickets seamlessly.

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database
- **Prisma ORM** - Database toolkit
- **Redis** - Caching and session management
- **Passport JWT** - Authentication
- **Swagger** - API documentation

### Frontend (Coming Soon)
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library

## Project Structure

```
tukki-event/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── users/          # Users module
│   │   │   ├── prisma/         # Prisma service
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend (coming soon)
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared configs
│
├── docker-compose.yml
└── package.json
```

## Features

### Phase 1 - Authentication (✅ Complete)
- User registration with email validation
- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Secure password hashing

### Phase 2 - Organizations (Coming Next)
- Organization creation and management
- Member invitations
- Role management (Owner, Admin, Staff)
- Organization settings

### Phase 3 - Events
- Event creation and management
- Event publishing workflow
- Ticket configuration
- Event search and filtering

### Phase 4 - Registrations & Payments
- User registration for events
- Ticket purchasing
- QR code generation
- Payment processing
- Registration validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tukki-event
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cd apps/api
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services**
   ```bash
   # From project root
   npm run docker:up
   ```

5. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

6. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

7. **Start the development server**
   ```bash
   npm run dev:api
   ```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Reset database (development only)
cd apps/api && npx prisma migrate reset
```

## API Documentation

Once the server is running, visit http://localhost:3000/api/docs for the complete Swagger API documentation.

### Available Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

#### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

## Database Schema

### User Model
- Authentication and profile information
- Role-based access (USER, ORGANIZER, SUPER_ADMIN)
- Email verification status

### Organization Model
- Organization details and settings
- Owner and member management
- Event associations

### Event Model
- Event information and scheduling
- Capacity and location
- Publishing status

### Ticket Model
- Ticket types and pricing
- Availability and sales tracking
- Sale period configuration

### Registration Model
- User event registrations
- QR code generation
- Status tracking (PENDING, CONFIRMED, CANCELLED, ATTENDED)

### Payment Model
- Payment processing
- Transaction tracking
- Multiple payment providers

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build
```

## Development Workflow

1. Create a new feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally

3. Run linting and formatting
   ```bash
   cd apps/api
   npm run lint
   npm run format
   ```

4. Commit your changes
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. Push and create a pull request

## Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tukki_event"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV="development"
```

## Security Best Practices

- All passwords are hashed using bcrypt
- JWT tokens with short expiration times
- Refresh token rotation
- Rate limiting enabled
- Input validation using class-validator
- CORS configuration
- SQL injection protection via Prisma

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Roadmap

- [x] Phase 1: NestJS Setup & Authentication
- [ ] Phase 2: Organizations Module
- [ ] Phase 3: Events Module
- [ ] Phase 4: Tickets & Registrations
- [ ] Phase 5: Payment Integration
- [ ] Phase 6: Next.js Frontend
- [ ] Phase 7: Dashboard & Analytics
- [ ] Phase 8: Email Notifications
- [ ] Phase 9: Production Deployment

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for event organizers and attendees**
