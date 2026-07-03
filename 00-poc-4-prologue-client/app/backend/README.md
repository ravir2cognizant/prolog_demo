# Prologue BFF (POC)

Express 4 / TypeScript 5.9 backend-for-frontend, implementing the sprint-01 ED-001..008
endpoint contracts. ED-009/010 are stubbed (501 Not Implemented) pending OQ-011/OQ-012.

This is a **proof-of-concept**: state is held in an in-memory `Map` per domain. There
is no database, ORM, or external cache. Process restart wipes all journal entries,
line items, and posts back to the seed.

## Quick start

```bash
npm install
cp .env.example .env       # only if .env doesn't already exist
npm run dev                # http://localhost:4000
```

Visit `http://localhost:4000/api-docs` for the self-rendered endpoint inventory.
A JSON variant is at `/api-docs.json` for CI / scripts.

## Scripts

| Script              | Purpose                                                 |
|---------------------|---------------------------------------------------------|
| `npm run dev`       | tsx watch -- live-reload Node                          |
| `npm run lint`      | `tsc --noEmit` -- 0-error type-check (no ESLint here)  |
| `npm test`          | vitest run -- supertest integration suites             |
| `npm run build`     | emit `dist/` via `tsconfig.build.json`                 |
| `npm start`         | node dist/server.js (after `build`)                    |

## Environment

All variables ship in `.env.example` with dev-safe defaults. Every prod-sensitive
value has an inline `# For staging/prod: ...` comment. Highlights:

| Variable                       | Dev default                | Notes                                       |
|--------------------------------|----------------------------|---------------------------------------------|
| `NODE_ENV`                     | `development`              | `production` forbids `AUTH_DEV_BYPASS=1`    |
| `PORT`                         | `4000`                     |                                             |
| `CORS_ORIGIN`                  | `http://localhost:5173`    | Comma-separated allow-list                  |
| `BODY_LIMIT`                   | `100kb`                    | express.json size cap                       |
| `LOG_LEVEL`                    | `info`                     | Pino                                        |
| `AUTH_DEV_BYPASS`              | `1`                        | Accepts any bearer; refuses in prod         |
| `JWKS_URI` / `JWT_*`           | empty                      | Production JWT path (not wired in POC)      |
| `OTEL_EXPORTER_OTLP_ENDPOINT`  | empty                      | OTel init is a safe no-op when empty        |
| `ENABLE_API_DOCS`              | `1`                        | Set to `0` (or omit) in prod                |

The Zod schema in `src/config/env.ts` provides the same defaults so the service
boots even with no `.env` file present.

## Endpoint surface (sprint-01)

| Method | Path                                              | Notes                          |
|--------|---------------------------------------------------|--------------------------------|
| GET    | /healthz, /readyz, /metrics, /api-docs            | Public                         |
| GET    | /navigation/menu                                  | ED-001                         |
| GET    | /journal-entries/:journalId                       | ED-002                         |
| POST   | /journal-entries                                  | ED-003                         |
| PUT    | /journal-entries/:journalId                       | ED-003 (companyId locked)      |
| GET    | /reference/companies                              | ED-003 + ED-008                |
| GET    | /reference/journal-entry-types                    | ED-003                         |
| GET    | /journal-entries/:journalId/lines                 | ED-004                         |
| POST   | /journal-entries/:journalId/lines                 | ED-004                         |
| PUT    | /journal-entries/:journalId/lines/:lineId         | ED-004                         |
| DELETE | /journal-entries/:journalId/lines/:lineId         | ED-004                         |
| GET    | /accounts/:accountCode                            | ED-004                         |
| POST   | /journal-entries/:journalId/post                  | ED-006                         |
| GET    | /journal-entries/:journalId/navigation            | ED-007                         |
| POST   | /journal-entries/:journalId/source-document       | ED-009 stub (501)              |
| GET    | /journal-entries/:journalId/source-document       | ED-009 stub (501)              |
| DELETE | /journal-entries/:journalId/source-document       | ED-009 stub (501)              |
| POST   | /gl-imports                                       | ED-010 stub (501)              |
| GET    | /gl-imports/:importId/status                      | ED-010 stub (501)              |

Every protected route is mounted **after** `app.use(authn)`. Public routes are
mounted before. The `/api-docs` page lists everything except itself.

## Architecture layers

```
routes/        Express Router per domain; documented() metadata next to route
controllers/   asyncHandler wrapper (no domain controllers in this POC)
services/      Business logic; the only place that talks to the store
store/         In-memory Maps + seed fixtures
domain/        TypeScript types + Zod request schemas
docs/          /api-docs registry + HTML renderer
middleware/    helmet / cors / authn / requestLog / metrics / errorHandler
config/        env / logger / otel
util/          AppError + counter helpers
```

A service never imports Express. A controller never calls the store directly.

## In-memory store caveat

- No persistence; state lives for the lifetime of the Node process.
- Restart returns to the seed (3 companies, 3 JE types, 9 journal entries
  including one Posted, one unbalanced, and one empty draft used by TC-BFF-022).
- Idempotency: a fresh `memoryStore.reset(); seedStore()` yields identical IDs.

## Tests

Vitest + supertest, run with `npm test`. Coverage in this POC:

- `health.spec.ts` -- public endpoints (healthz / readyz / metrics)
- `protected.spec.ts` -- AUTH_DEV_BYPASS bearer flow, nav + JE + companies
- `validation.spec.ts` -- Zod 400s + 404
- `api-docs.spec.ts` -- /api-docs HTML + /api-docs.json contents

A-08's full BFF test plan (TC-BFF-001..035) lives outside this package at
`sprints/sprint-01/tests/bff/` and imports the factories exported from
`src/store/seed.ts`.
