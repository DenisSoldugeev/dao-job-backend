# DAO Job Backend

## Technologies

- Node.js 20+ + TypeScript
- NestJS + Fastify
- PostgreSQL + Prisma
- JWT authentication
- S3 (MinIO) for file storage
- Zod validation

## Installation

```bash
# Install dependencies
npm install

# Copy .env file
cp .env.example .env
# Edit .env and set your values

# Start database and MinIO
docker compose up -d

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

API will be available at `http://localhost:3000`

## API Structure

### Auth
- `POST /api/auth/telegram` - Telegram WebApp authentication

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/me/role` - Change role (JWT)

### Categories
- `GET /api/categories` - List categories with specializations
- `GET /api/categories/:slug` - Get specific category

### Tasks
- `POST /api/tasks` - Create task (JWT)
- `GET /api/tasks?categoryId&specializationId&status&skip&take` - List tasks
- `PATCH /api/tasks/:id/status` - Update task status (JWT)

### Responses
- `POST /api/responses` - Respond to task (JWT)
- `GET /api/responses?taskId&skip&take` - List responses

### Reviews
- `POST /api/reviews` - Leave review (JWT)

### Uploads
- `POST /api/uploads/presign` - Get presigned URL for upload (JWT)

## Database

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Run migrations
npm run prisma:migrate

# Run seed
npm run prisma:seed

# Open Prisma Studio
npx prisma studio
```

## Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Project Structure

```
src/
  common/          # Common utilities (guards, pipes)
  config/          # Configuration and env validation
  infra/           # Infrastructure (Prisma)
  modules/         # Application modules
    auth/          # Telegram authentication
    users/         # User management
    categories/    # Categories and specializations
    tasks/         # Tasks
    responses/     # Task responses
    reviews/       # Reviews
    uploads/       # File uploads (S3)
  main.ts          # Entry point
  app.module.ts    # Root module
```

## Validation

All DTOs are validated using Zod. Schema examples in `src/modules/tasks/dto.ts`.

## Security

- JWT tokens expire in 2 hours
- HMAC validation for Telegram initData
- Helmet + CORS configured
- File upload limits enforced
- Access control for all mutations

## Environment Variables

See `.env.example` for the complete list.

## License

UNLICENSED
