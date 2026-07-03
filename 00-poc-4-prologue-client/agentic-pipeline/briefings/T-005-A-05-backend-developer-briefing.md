# T-005 Briefing — A-05 Backend Developer
Sprint: sprint-01 | Task: T-005 | Phase: Backend Implementation
Date: 2026-05-23 | Hook result: PROCEED

## Paths
- Input ED: `sprints\sprint-01\endpoint-design\` (ED-001..010; ED-009/010 are deferred stubs)
- Input RC: `sprints\sprint-01\req-outputs\` (RC-001..010)
- Output: `app\backend\` (accumulates across sprints)
- Hash file: `app\backend\.input-hash-sprint-01`
- BFF test cases: `sprints\sprint-01\tests\bff\test-cases\TC-BFF-001..035.md` (T-010 complete)
- BFF spec scaffold: `sprints\sprint-01\tests\bff\t010.spec.ts`

## Scope
**In scope:** ED-001..ED-008 — implement every endpoint exactly (method + path + request/response + auth + status codes).
**Deferred stubs:** ED-009/010 (OQ-011/OQ-012 pending) — stub routes that return 501 Not Implemented.
**Seed factories required:** `src\test\seed.ts` — one factory per Zod schema; A-08 imports these.
**GET /api-docs:** self-documented HTML endpoint (reflects actual routes via `documented()` registry).

## Endpoint Contracts (implement all)

### ED-001 — GET /navigation/menu (tag: navigation, auth: bearer)
Response: `{ items: NavItem[] }` — `{ id, label, route, level(0|1), parentId|null, alertState: boolean, enabled: boolean }`
Errors: 401

### ED-002 — GET /journal-entries/:journalId (tag: journal-entries, auth: bearer)
Response: 16 header fields + `lines: LineItem[]` + `totals: { totalDebits, totalCredits, difference }` + `balanced: boolean`
Errors: 401, 404

### ED-003 — JE Create + Edit + Ref Lists (tag: journal-entries, auth: bearer)
- POST /journal-entries → 201 `{ journalId, journalNumber, status: "Unposted", editDateTime, editUserId }`
  Required: companyId, journalEntryTypeId, transactionDate, description. Errors: 422 on missing required.
- PUT /journal-entries/:journalId → 200; companyId NOT accepted (locked). description max 500 chars.
  Errors: 404, 403 on posted JE, 422
- GET /reference/companies → `Company[]` `{ companyId, companyName }` (public auth not needed: bearer required)
- GET /reference/journal-entry-types → `JournalEntryType[]` `{ typeId, typeName }`

### ED-004 — Line Items CRUD + Account Lookup (tag: journal-entries, auth: bearer)
- GET /journal-entries/:journalId/lines → `LineItem[]`
  LineItem: `{ lineId, lineNumber, accountCode, accountDescription, currencyId, debitAmount, creditAmount, description?, referenceNumber? }`
- POST .../lines → 201 LineItem (auto-assign lineId, lineNumber, accountDescription)
  Validation: debitAmount > 0 AND creditAmount > 0 on same line → 422 (mutual exclusion)
  Errors: 403 on posted JE
- PUT .../lines/:lineId → 200 LineItem (same mutual-exclusion validation)
- DELETE .../lines/:lineId → 204 No Content
- GET /accounts/:accountCode → `{ accountCode, accountDescription, isValid, segment1..segment5 }`
  Errors: 404 unknown code; `isValid: false` for inactive accounts

### ED-005 — Balance (no new endpoints)
Mutation endpoints (POST/PUT/DELETE lines) MUST return updated `totals` in their response bodies.

### ED-006 — POST /journal-entries/:journalId/post (tag: journal-entries, auth: bearer)
- 200 OK → `{ status: "Posted", postedDateTime, posterUserId }`
- 422 if debits ≠ credits (unbalanced)
- 409 if already Posted
- Audit fields (postedDateTime, posterUserId) never accepted in request body

### ED-007 — GET /journal-entries/:journalId/navigation (tag: journal-entries, auth: bearer)
Query: `sortField` (default "journalNumber"; valid: "journalNumber" | "transactionDate" | "editDateTime"), `sortOrder` (default "asc"; "asc" | "desc"), `companyId?`
Response: `{ currentJournalId, firstJournalId, previousJournalId|null, nextJournalId|null, lastJournalId, isFirst, isLast, totalCount }`
Errors: 404, 400 on invalid sortField

### ED-008 — GET /reference/companies (tag: reference, auth: bearer)
Same endpoint as ED-003; ensure coverage in route + documented() registry.

## Technology Stack (mandatory — no deviations)
Node.js 22 LTS · Express 4 · TypeScript 5.9 · Clean Architecture (routes→controllers→services→store)
Helmet · CORS (configurable allow-list) · Pino 10.1 (named placeholders, `redact.paths`, no PII)
prom-client 15.1 (/metrics) · OpenTelemetry OTLP (safe no-op when endpoint empty)
jose 5.7 + openid-client 5.7 for JWT · zod-to-json-schema for /api-docs

## File Structure
```
app/backend/
  src/
    server.ts              bootstrap
    app.ts                 composition (helmet, cors, body-parser, authn, routes, 404, errorHandler)
    config/{env,logger,otel}.ts
    middleware/{auth,requestLog,metrics,errorHandler}.ts
    routes/{navigation,journal-entries,reference,docs}.routes.ts
    controllers/asyncHandler.ts
    services/{navigation,journal-entry,line-item,account,reference}.service.ts
    store/{memoryStore,seed}.ts    -- in-memory Maps + realistic fixtures
    domain/{types,schemas}.ts      -- TypeScript types + Zod schemas
    docs/{registry,handler,responses}.ts   -- /api-docs HTML renderer
    util/{errors,ids}.ts
    test/{setup.ts,*.spec.ts}      -- 3-4 supertest+Vitest tests
  package.json · tsconfig.json · tsconfig.build.json
  vitest.config.ts · .env.example · .gitignore · README.md
  .input-hash-sprint-01
```

## Key Design Decisions
- **Auth:** All routes behind `authn` middleware EXCEPT `/healthz`, `/readyz`, `/metrics`, `/api-docs`.
  `AUTH_DEV_BYPASS=1` bypass mode for dev (must refuse to start in production: check NODE_ENV).
- **In-memory store only:** no SQL/ORM/Redis. Each domain has its own `Map<string, T>` in `src/store/memoryStore.ts`.
- **Seed fixtures:** realistic data — at least 3 companies, 3 journal-entry-types, 5 journal entries (mix of Posted/Unposted, balanced/unbalanced), 3-4 line items per JE, 5+ accounts.
- **Error format:** RFC 7807 problem+json for all 4xx/5xx. `AppError` from `src/util/errors.ts`.
- **Port:** 4000 (default). `CORS_ORIGIN=http://localhost:5173` (default).
- **Body parser:** size limit on `express.json()`.
- **Route ordering:** public routes before `app.use(authn)`; catch-all 404 last.
- **lineNumber:** auto-assigned sequentially per JE when line is added (TC-BFF-022 validates).
- **company lock on JE:** companyId locked post-creation — PUT ignores/rejects companyId in body.

## seed.ts Factory Requirements
A-08 imports from `src/test/seed.ts`. Export factory functions for:
```typescript
export const validJournalEntryPayload = (): CreateJournalEntryBody => ({ ... })
export const validLineItemPayload = (): CreateLineItemBody => ({ ... })
export const validAccountCode = (): string => 'US-01-1000-100-01'  // regex-valid
// etc. — one factory per Zod request schema
```

## Env Bootstrap (SKILL — mandatory)
After writing `.env.example`, check if `app/backend/.env` exists.
If absent: copy `.env.example` → `.env`; include `ENV_CREATED_HB` block in completion report; do NOT self-declare T-005 complete.
If present: skip, no blocker.

## DoD Checklist
- [ ] Every ED-001..008 endpoint implemented (method + path + Zod validation + response + auth + status codes)
- [ ] ED-009/010 stub routes returning 501
- [ ] GET /api-docs HTML page: all ED routes listed (grouped by tag), /api-docs itself excluded
- [ ] Helmet, CORS, body-parser size limit, Pino, prom-client /metrics, OTel safe-no-op, error handler wired
- [ ] All routes behind authn except the 4 public ones; AUTH_DEV_BYPASS=1 works; refuses in production
- [ ] In-memory store seeded with realistic fixtures (3 companies, 5 JEs, etc.)
- [ ] seed.ts exports one factory per Zod schema
- [ ] 3-4 supertest+Vitest tests pass (health, protected route with dev-bypass token, validation-failure, /api-docs)
- [ ] tsc --noEmit: 0 errors; vitest: all pass; npm run dev: boots and /healthz returns {"status":"ok"}
- [ ] No console.log; no PII in logs; no string-interpolated log messages
- [ ] .env.example with dev-friendly defaults + upper-env comments
- [ ] ENV_CREATED_HB block in completion report (if .env was new)
- [ ] .input-hash-sprint-01 written
- [ ] Report task-complete to Orchestrator with endpoint count + seed factory list
