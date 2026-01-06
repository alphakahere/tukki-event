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

### Phase 2 - Organizations (✅ Complete)
- Organization creation and management
- Member invitations with role assignment
- Role management (Owner, Admin, Staff)
- Organization settings and customization
- Permission-based access control
- Member management (add, remove, update roles)

### Phase 3 - Events (✅ Complete)
- Event creation and management
- Event publishing workflow (draft/published/unpublished)
- Event status management (DRAFT, PUBLISHED, ONGOING, COMPLETED, CANCELLED)
- Event search and filtering with advanced queries
- Capacity management and tracking
- Location and venue details
- Auto-generated URL slugs

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

#### Organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations` - Get user's organizations
- `GET /api/v1/organizations/:id` - Get organization by ID
- `PATCH /api/v1/organizations/:id` - Update organization (Owner/Admin)
- `DELETE /api/v1/organizations/:id` - Delete organization (Owner only)
- `POST /api/v1/organizations/:id/members` - Invite member (Owner/Admin)
- `GET /api/v1/organizations/:id/members` - Get organization members
- `PATCH /api/v1/organizations/:id/members/:userId` - Update member role (Owner/Admin)
- `DELETE /api/v1/organizations/:id/members/:userId` - Remove member (Owner/Admin)
- `GET /api/v1/organizations/:id/events` - Get organization events

#### Events
- `POST /api/v1/events` - Create event
- `GET /api/v1/events` - Get all events with filters and search
- `GET /api/v1/events/slug/:slug` - Get event by slug
- `GET /api/v1/events/:id` - Get event by ID
- `PATCH /api/v1/events/:id` - Update event (Owner/Admin)
- `DELETE /api/v1/events/:id` - Delete event (Owner/Admin)
- `POST /api/v1/events/:id/publish` - Publish event (Owner/Admin)
- `POST /api/v1/events/:id/unpublish` - Unpublish event (Owner/Admin)

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
- [x] Phase 2: Organizations Module
- [x] Phase 3: Events Module
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
