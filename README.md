# HmarePanditJi - Hindu Priest Booking Platform

A comprehensive monorepo for a Hindu priest booking platform, enabling users to book pandits (priests) for religious ceremonies and rituals.

## 🏗️ Architecture

This is a **pnpm monorepo** powered by **Turborepo** with the following structure:

### Apps
- **`apps/web`** - Customer-facing Next.js web application
- **`apps/pandit`** - Priest-facing Next.js application with voice AI
- **`apps/admin`** - Admin dashboard for platform management

### Services
- **`services/api`** - Main Fastify-based API service (TypeScript)
- **`services/search-service`** - Elasticsearch-powered search service
- **`services/booking-service`** - Booking management service (placeholder)

### Packages
- **`packages/db`** - Prisma ORM schema and database utilities
- **`packages/types`** - Shared TypeScript type definitions
- **`packages/ui`** - Shared UI component library
- **`packages/utils`** - Shared utilities (logger, formatters, etc.)

### Infrastructure
- PostgreSQL 16 (Database)
- Redis 7 (Cache & Sessions)
- Elasticsearch 8.11 (Search)
- pgAdmin (Database management)

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, Zustand
- **Backend**: Fastify, Express, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Search**: Elasticsearch
- **Voice AI**: Sarvam AI, Bhashini, Deepgram
- **Chat AI**: DeepSeek, Anthropic Claude
- **Payments**: Razorpay
- **SMS/OTP**: MSG91
- **Monitoring**: Sentry
- **Deployment**: Vercel (frontends), Render (API)

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- Docker & Docker Compose (for local infrastructure)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start infrastructure (PostgreSQL, Redis, Elasticsearch)
docker-compose up -d

# Generate Prisma client
pnpm --filter @hmarepanditji/db generate

# Run database migrations
pnpm --filter @hmarepanditji/db migrate

# Start all services in development mode
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and services
pnpm lint         # Run ESLint on all workspaces
pnpm test         # Run test suites
pnpm typecheck    # Run TypeScript type checking
```

## 🗄️ Database

The project uses Prisma ORM for database management:

```bash
# Create a new migration
pnpm --filter @hmarepanditji/db migrate:dev

# Reset database (dev only)
pnpm --filter @hmarepanditji/db migrate:reset

# Seed database
pnpm --filter @hmarepanditji/db seed
```

## 🔐 Security Notes

- **NEVER** commit `.env` files to git
- All passwords in `.env.example` are placeholders
- Elasticsearch security is disabled in dev only
- JWT secrets must be properly configured for production
- Aadhaar data is encrypted with AES-256

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific workspace
pnpm --filter @hmarepanditji/web test
pnpm --filter @hmarepanditji/api test
```

## 📝 Code Quality

This project enforces:
- **ESLint** for linting (flat config, ESLint 9)
- **Prettier** for code formatting
- **TypeScript** strict mode for type safety
- **Husky** pre-commit hooks for automated checks

```bash
# Lint all code
pnpm lint

# Format all code
pnpm format

# Type check all workspaces
pnpm typecheck
```

## 🌐 Environment Variables

See `.env.example` for all required environment variables. Key services:

- **Database**: PostgreSQL connection
- **Auth**: JWT secrets and encryption keys
- **Payments**: Razorpay API keys
- **SMS**: MSG91 authentication
- **Voice AI**: Sarvam AI, Bhashini API keys
- **Chat AI**: DeepSeek, Anthropic API keys
- **Monitoring**: Sentry DSN

## 🚨 Known Issues & TODOs

- [ ] Complete booking-service implementation
- [ ] Convert search-service to TypeScript
- [ ] Add comprehensive test coverage
- [ ] Implement proper job queue for review reminders
- [ ] Set up CI/CD pipeline
- [ ] Unify UI component naming conventions

## 📄 License

MIT - See LICENSE file for details

## 👥 Contributing

Please read the development guidelines and ensure:
1. All tests pass before submitting PRs
2. Code follows the established style guide
3. New features include test coverage
4. Documentation is updated

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Review error logs in respective app folders
- Consult the MIGRATION_GUIDES.md for migration help
