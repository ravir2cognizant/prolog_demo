# Briefing: T-005 Backend Implementation -- Backend Developer (A-05)
# Sprint: sprint-01 | Prepared by: A-00 | Date: 2026-05-21

## Task
Implement the BFF (Backend-for-Frontend) layer in app/backend/ using Node.js 22 + Express 4 + TypeScript 5.
Implement every endpoint from ED-001 through ED-017 exactly (same method, path, request validation, response shape, auth).

## Dependencies (all satisfied)
- T-GATE: [x] Complete -- all 6 agents signed off
- T-002:  [x] Complete -- 17 ED cards (ED-001--ED-017) available at sprints/sprint-01/endpoint-design/

## Input Paths
- ED cards:  sprints/sprint-01/endpoint-design/ED-001.md through ED-017.md
- RC cards:  sprints/sprint-01/req-outputs/RC-001.md through RC-017.md (business logic reference)

## Output Path
- app/backend/ (not sprint-scoped; accumulates across sprints)
- Sprint-scoped hash: app/backend/.sprint-01.input-hash

## Endpoint Inventory (ED summary)
ED-001: GET /journal-entries/{id}, POST /journal-entries, PUT /journal-entries/{id}, GET /companies, GET /journal-entry-types, GET /source-documents, GET /allocation-methods
ED-002: GET /accounts (JE account picker), GET /currencies
ED-003: Balance validation contract embedded in POST/PUT /journal-entries (no new endpoints)
ED-004: POST /journal-entries/{id}/post, POST /journal-entries/{id}/unpost
ED-005: POST /journal-entries/{id}/reverse
ED-006: GET /journal-entries (cursor-paginated list with firstCursor/lastCursor/nextCursor/prevCursor/isFirst/isLast)
ED-007: Audit fields in GET /journal-entries/{id} (no new endpoints)
ED-008: GET /routing-rules, POST /journal-entries/{id}/submit-for-approval, POST .../approve, POST .../reject
ED-009: GET /journal-entries (extended filters: hasOpenQuestions), GET /journal-entries/export
ED-010: GET /accrual-schedules, POST /accrual-schedules, PUT /accrual-schedules/{id}, DELETE /accrual-schedules/{id}, GET /accrual-schedules/{id}/entries
ED-011: GET /allocation-rules, POST /allocation-rules, PUT /allocation-rules/{id}, DELETE /allocation-rules/{id}, POST /allocation-rules/{id}/run
ED-012: GET /report-designs, POST /report-designs, PUT /report-designs/{id}, POST /report-designs/{id}/run, GET /report-designs/{id}/export
ED-013: GET /budgets, PUT /budgets, POST /budgets/import, GET /budgets/export
ED-014: GET /consolidation/sources, POST /consolidation/sources, POST /consolidation/run, GET /consolidation/runs, GET /consolidation/runs/{id}/report
ED-015: GET /fiscal-years, POST /fiscal-years, GET /fiscal-years/{id}/periods, PUT .../periods/{periodId}/open, PUT .../periods/{periodId}/close, POST /fiscal-years/{id}/year-end-close
ED-016: POST /transactions/import (202 + jobId), GET /transactions/import/{jobId}/status, GET /transactions/import/{jobId}/errors, GET /transactions/export
ED-017: GET /accounts, GET /accounts/{id}, POST /accounts, PUT /accounts/{id}, GET /accounts/{id}/balances

## Technology Stack
Node.js 22 LTS, Express 4, TypeScript 5.9, ESM ("type": "module"), Helmet, CORS, Pino 10, prom-client 15, OpenTelemetry (safe no-op), jose 5 + openid-client 5, zod 3, zod-to-json-schema 3, tsx (dev), vitest + supertest (test)

## Architecture
- Clean Architecture: routes → controllers → services → store
- In-memory Map<string, T> per entity (POC constraint -- no database)
- Seed data for all entities so frontend has demo data on boot
- Auth: Bearer JWT via jose; AUTH_DEV_BYPASS=1 skips JWT in dev with full-access dev principal
- API docs: GET /api-docs returns self-contained HTML (NOT JSON); listed at boot; cannot drift

## DoD Checklist
- [ ] Every ED endpoint implemented (method + path + validation + response + auth)
- [ ] GET /api-docs returns HTML with all endpoints grouped by tag
- [ ] Helmet, CORS, JSON body-parser (size limit), Pino request log, prom-client, OTel, error handler wired
- [ ] All routes except /healthz /readyz /metrics /api-docs behind Bearer JWT
- [ ] In-memory store seeded; realistic demo data
- [ ] 3-4 supertest+Vitest tests pass (public endpoint, protected endpoint, validation failure, /api-docs)
- [ ] No console.log; no PII in logs; no string-interpolated log messages
- [ ] .sprint-01.input-hash produced
