# Prologue BFF

Node.js 22 + Express 4 + TypeScript 5 BFF for the Prologue General Ledger POC.

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 22 (ESM) |
| Framework | Express 4 |
| Language | TypeScript 5 (strict, NodeNext) |
| Auth | JWT / JWKS (jose); dev bypass via `AUTH_DEV_BYPASS=1` |
| Validation | Zod |
| Logging | Pino + pino-pretty (dev) |
| Metrics | prom-client (`/metrics`) |
| Tests | Vitest + supertest |
| Store | In-memory Maps (POC only) |

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Server starts on `http://localhost:4000`. API docs at `http://localhost:4000/api-docs`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with tsx hot-reload |
| `npm run lint` | TypeScript type-check (no emit) |
| `npm test` | Run Vitest test suite |

## Environment variables

See `.env.example` for all variables with descriptions. Key variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | HTTP listen port |
| `AUTH_DEV_BYPASS` | `1` | Skip JWT validation in dev; injects full-access principal |
| `JWKS_URI` | _(empty)_ | JWKS endpoint URL for production JWT validation |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `LOG_LEVEL` | `info` | Pino log level |
| `ENABLE_API_DOCS` | `1` | Serve self-documented HTML at `/api-docs` |

## Architecture

```
src/
├── config/         env, logger, otel
├── controllers/    asyncHandler (ah() wrapper)
├── docs/           API docs registry + HTML handler
├── domain/         TypeScript types + Zod schemas
├── middleware/     auth, errorHandler, metrics, requestLog
├── routes/         One file per domain area + index.ts
├── services/       Business logic (no Express imports)
├── store/          In-memory Maps + seed data
├── test/           Vitest specs + setup
├── util/           errors, ids, paging
├── app.ts          Express app composition
└── server.ts       Bootstrap entry point
```

## API endpoints

Visit `GET /api-docs` for a live self-documented HTML page listing all endpoints grouped by domain tag.

## Auth

In development (`AUTH_DEV_BYPASS=1`), every request is injected with a full-access principal with all seven roles:
- `gl-accountant`
- `gl-supervisor`
- `gl-administrator`
- `finance-administrator`
- `finance-manager`
- `finance-reporting-manager`
- `group-finance-manager`

In production, set `JWKS_URI` to your identity provider's JWKS endpoint. The `roles` claim in the JWT payload is used for role-based access control.

## Error responses

All errors follow [RFC 7807 Problem Details](https://www.rfc-editor.org/rfc/rfc7807) (`application/problem+json`):

```json
{
  "type": "https://prologue.example/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request failed validation",
  "code": "VALIDATION_ERROR",
  "issues": [{ "path": "companyId", "message": "Required" }]
}
```
