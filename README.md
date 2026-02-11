# HmarePanditJi

> India's first platform for booking verified Hindu priests (Pandits) online.
> Phase 1 — Delhi-NCR · Web only

## Monorepo Structure

```
hmarepanditji/
├── apps/
│   ├── web/        → Customer booking portal    (port 3000)  primary #f49d25
│   ├── pandit/     → Pandit dashboard            (port 3001)  primary #f09942
│   └── admin/      → Admin console               (port 3002)  primary #137fec
├── packages/
│   ├── db/         → Prisma schema + client      (PostgreSQL 16)
│   ├── types/      → Shared TypeScript types
│   ├── utils/      → formatPrice, formatDate, slugify…
│   └── ui/         → Button, Card, Modal, Icon components
├── services/
│   └── api/        → Express REST API            (port 4000)
├── docker-compose.yml
└── turbo.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS 3 |
| Backend | Express 4 + TypeScript + helmet + morgan |
| Database | PostgreSQL 16 via Prisma ORM 5 |
| Auth | Firebase Phone OTP + JWT |
| Payments | Razorpay (test mode) |
| SMS | Twilio |
| Maps | Google Maps JavaScript API |
| Monorepo | Turborepo 2 + pnpm 9 workspaces |

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- Docker Desktop

### 1 — Navigate to project
```bash
cd E:\HmarePanditJi\hmarepanditji
```

### 2 — Create environment file
```bash
copy .env.example .env
```

### 3 — Start database (Docker)
```bash
docker compose up -d
```
- PostgreSQL → `localhost:5432`
- pgAdmin → `http://localhost:5050` (admin@hmarepanditji.com / admin123)

### 4 — Install dependencies
```bash
pnpm install
```

### 5 — Push database schema
```bash
pnpm db:push
```

### 6 — Start all apps
```bash
pnpm dev
```

| App | URL |
|---|---|
| Web (customer) | http://localhost:3000 |
| Pandit dashboard | http://localhost:3001 |
| Admin console | http://localhost:3002 |
| REST API | http://localhost:4000 |

## Database Scripts

```bash
pnpm db:push       # push schema to DB (dev, no migration file)
pnpm db:migrate    # create + run migration (production)
pnpm db:studio     # open Prisma Studio GUI
pnpm db:generate   # regenerate Prisma client
```

## Environment Variables

Copy `.env.example` → `.env`. Key values for local dev are pre-filled.
Third-party keys (Firebase, Razorpay, Twilio, Google Maps) need your own accounts.

## GitHub

```
https://github.com/harshitsingh85420/HmarePanditJi
```
