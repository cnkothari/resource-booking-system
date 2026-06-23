# Resource Booking System

A full-stack application that lets employees reserve company resources (meeting rooms, vehicles, equipment, workspaces, …).

- **Frontend:** React 19 + TypeScript (Vite), Redux Toolkit, React Router, React Hook Form + Yup, Tailwind CSS
- **Backend:** Node.js + Express + TypeScript, TypeORM, Joi validation (layered: routes → services → repositories, functional style)
- **Database:** PostgreSQL 17 (via Docker)
- **Monorepo:** npm workspaces (`backend`, `frontend`)

> **Notes on the brief**
> - **No authentication** was specified, so the current user is chosen from an "Acting as" switcher in the header; new bookings are attributed to that user.
> - **Create React App is deprecated** (2025) and cannot scaffold React 19, so the frontend uses **Vite** (the modern, supported equivalent) while keeping the requested folder structure, Redux, routing and form setup.
> - **TSLint is deprecated** (since 2019); linting uses **ESLint + typescript-eslint**, its official successor, which enforces the same naming/type rules.
> - **Resource Types** are a normalized table, seeded and exposed as a dropdown (no dedicated management screen was listed).

---

## Prerequisites

- Node.js ≥ 20 (tested on 22)
- Docker (for PostgreSQL) — or a local PostgreSQL 15+ if you prefer

## Quick start

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start PostgreSQL (Docker)
npm run db:up

# 3. Seed sample data (users, resource types, resources, a few bookings)
npm run backend:seed

# 4. Run backend + frontend together
npm run dev
```

- API: http://localhost:4000/api  (health check: `GET /api/health`)
- Web: http://localhost:5173

Run them separately if you prefer:

```bash
npm run backend:dev     # API on :4000
npm run frontend:dev    # Vite dev server on :5173
```

## Environment

Both apps ship with working defaults (`backend/.env`, `frontend/.env`). Copy the `.env.example` files if you need to customise.

| Backend var      | Default                 | Purpose                          |
| ---------------- | ----------------------- | -------------------------------- |
| `PORT`           | `4000`                  | API port                         |
| `CORS_ORIGIN`    | `http://localhost:5173` | Allowed frontend origin          |
| `DB_*`           | see `.env`              | PostgreSQL connection            |
| `DB_SYNCHRONIZE` | `true`                  | Auto-create schema (dev only)    |

`frontend/.env` → `VITE_API_BASE_URL=http://localhost:4000/api`

## Project structure

```
resource-booking-system/
├── docker-compose.yml          # PostgreSQL 17
├── package.json                # npm workspaces + scripts
├── backend/
│   └── src/
│       ├── config/             # env + TypeORM data source
│       ├── entities/           # User, ResourceType, Resource, Booking (soft deletes)
│       ├── repositories/       # database query layer
│       ├── services/           # business logic + validation rules
│       ├── routes/             # REST endpoints (thin handlers)
│       ├── validators/         # Joi request schemas
│       ├── middlewares/        # validate, error handler, 404
│       ├── utils/              # AppError, pagination, booking helpers
│       └── database/seed.ts    # sample data
└── frontend/
    └── src/
        ├── app/                # Redux store + typed hooks
        ├── assets/
        ├── components/         # shared UI (Layout, Pagination, Modal, …)
        ├── features/           # Redux slices (createAsyncThunk) per domain
        ├── hooks/              # useDebounce
        ├── pages/              # Dashboard, Resources, Bookings, Users, 404
        ├── services/           # axios API clients
        ├── styles/             # Tailwind entry
        ├── types/              # shared TS types
        └── utils/              # formatting helpers
```

## REST API

Base URL `/api`. All responses are JSON: `{ success, data | message, pagination? }`.

| Method | Path                        | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/health`                   | Health check                             |
| GET    | `/dashboard/summary`        | Counts for dashboard cards               |
| GET    | `/resource-types`           | List resource types                      |
| GET    | `/users`                    | List users (`page`,`limit`,`search`)     |
| POST   | `/users`                    | Create user                              |
| GET    | `/users/:id`                | Get user                                 |
| PUT    | `/users/:id`                | Update user                              |
| DELETE | `/users/:id`                | Soft-delete user                         |
| GET    | `/resources`                | List resources (+`resourceTypeId`)       |
| POST   | `/resources`                | Create resource                          |
| GET    | `/resources/:id`            | Get resource                             |
| PUT    | `/resources/:id`            | Update resource                          |
| DELETE | `/resources/:id`            | Soft-delete (blocked if active bookings) |
| GET    | `/bookings`                 | List bookings (+`tag`,`resourceId`,`userId`) |
| POST   | `/bookings`                 | Create booking                           |
| GET    | `/bookings/:id`             | Get booking                              |
| PUT    | `/bookings/:id`             | Update booking                           |
| PATCH  | `/bookings/:id/cancel`      | Cancel booking (frees the slot)          |
| DELETE | `/bookings/:id`             | Soft-delete booking                      |

### Booking validation rules (enforced server-side)

- A resource cannot have overlapping **active** bookings.
- Minimum duration 30 minutes; maximum 8 hours.
- Start time cannot be in the past.
- End must be after start.
- Cancelling frees the resource (cancelled/soft-deleted bookings are ignored by the overlap check).

## Scripts

| Command                  | What it does                          |
| ------------------------ | ------------------------------------- |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL container  |
| `npm run backend:seed`   | Seed sample data                      |
| `npm run dev`            | Run backend + frontend concurrently   |
| `npm run lint`           | Lint both workspaces                  |
| `npm run build --workspace backend`  | Compile API to `dist/`    |
| `npm run build --workspace frontend` | Type-check + build web    |

## Re-seeding

The seed is idempotent — it skips if data already exists. To re-seed, drop the volume and start fresh:

```bash
npm run db:down && docker volume rm resource-booking-system_rbs_pgdata
npm run db:up && npm run backend:seed
```
