# T-010 Briefing — A-08 BFF Test Agent
Sprint: sprint-01 | Task: T-010 | Phase: Test Plan
Date: 2026-05-23 | Hook result: PROCEED

## Paths
- Input RC: `sprints\sprint-01\req-outputs\` (RC-001..010)
- Input ED: `sprints\sprint-01\endpoint-design\` (ED-001..010)
- Output test cases: `sprints\sprint-01\tests\bff\test-cases\` (TC-BFF-*.md)
- Output spec draft: `sprints\sprint-01\tests\bff\t010.spec.ts`

## Scope
**In scope:** RC-001..RC-008 + their ED counterparts (ED-001..008). Produce TC-BFF-### cards.
**Out of scope:** RC-009/ED-009 (OQ-011 pending), RC-010/ED-010 (OQ-012 pending) — deferred stubs only.
**Note:** app/backend does not exist yet (T-005 runs after T-010). No Zod schemas to self-validate against. Use TC card values as-is; note "seed.ts pending" in spec.

## RC ↔ ED Mapping
| RC | ED | Endpoints |
|----|-----|-----------|
| RC-001 | ED-001 | GET /navigation/menu |
| RC-002 | ED-002 | GET /journal-entries/{journalId} |
| RC-003 | ED-003 | POST /journal-entries · PUT /journal-entries/{journalId} · GET /reference/companies · GET /reference/journal-entry-types |
| RC-004 | ED-004 | GET /journal-entries/{journalId}/lines · POST …/lines · PUT …/lines/{lineId} · DELETE …/lines/{lineId} · GET /accounts/{accountCode} |
| RC-005 | ED-005 | No new endpoints (client-side calc); mutation endpoints return updated totals{} |
| RC-006 | ED-006 | POST /journal-entries/{journalId}/post |
| RC-007 | ED-007 | GET /journal-entries/{journalId}/navigation |
| RC-008 | ED-008 | GET /reference/companies (same endpoint as ED-003) |

## Endpoint Contracts (key details per ED card)

### ED-001 — GET /navigation/menu
- Auth: required
- Response: `NavItem[]` → `{ id, label, route, level(0|1), parentId?, alertState(none|dot), enabled }`
- Test: returns flat array; client reconstructs tree; disabled items included in response

### ED-002 — GET /journal-entries/{journalId}
- Auth: required
- Response shape: all 16 JE header fields + `lines[]` (LineItem[]) + `totals{ totalDebits, totalCredits, difference }` + `balanced: boolean`
- Errors: 404 when journalId not found
- Test: shape completeness; 404 on unknown ID; `balanced = true` when debits == credits

### ED-003 — JE Create + Edit + Reference Lists
- POST /journal-entries → 201 Created; returns `{ journalId, journalNumber, status: "Unposted", editDateTime, editUserId }`
  - Required fields: companyId, journalEntryTypeId, transactionDate, description
  - Company locked post-creation (OQ-004b: conservative = always locked on PUT)
- PUT /journal-entries/{journalId} → 200 OK
  - companyId NOT accepted in PUT body (locked)
  - description max 500 chars (OQ-005 default)
- GET /reference/companies → `Company[]` → `{ companyId, companyName }`
- GET /reference/journal-entry-types → `JournalEntryType[]` → `{ typeId, typeName }`
- Errors: POST 422 on missing required fields; PUT 404 on unknown ID; PUT 422 on invalid data

### ED-004 — Line Items CRUD + Account Lookup
- GET /journal-entries/{journalId}/lines → `LineItem[]`
  - LineItem shape: `{ lineId, lineNumber, accountCode, accountDescription, currencyId, debitAmount, creditAmount, description?, referenceNumber? }`
- POST .../lines → 201 Created; returns full LineItem with auto-assigned `lineId + lineNumber + accountDescription`
  - Validation: cannot have both debitAmount > 0 AND creditAmount > 0 on same line → 422
- PUT .../lines/{lineId} → 200 with updated LineItem
  - Same mutual-exclusion validation
- DELETE .../lines/{lineId} → 204 No Content
- GET /accounts/{accountCode} → `{ accountCode, accountDescription, isValid, segment1..segment5 }`
  - 404 when accountCode not found; `isValid: false` for inactive accounts

### ED-005 — Balance (no new endpoints)
- Mutation endpoints (POST/PUT/DELETE lines) MUST include updated `totals{ totalDebits, totalCredits, difference }` in response
- Test: verify totals recalculated correctly in POST/PUT/DELETE line responses

### ED-006 — Post Entry
- POST /journal-entries/{journalId}/post
  - 200 OK → `{ status: "Posted", postedDateTime, posterUserId }`
  - 422 if journal is not balanced (debits ≠ credits)
  - 409 if journal already Posted
  - Audit fields never accepted in request body

### ED-007 — Record Navigation
- GET /journal-entries/{journalId}/navigation
  - Query params: `sortField` (default "journalNumber"), `sortOrder` (default "asc"), `companyId?`
  - Response: `{ currentJournalId, firstJournalId, previousJournalId, nextJournalId, lastJournalId, isFirst, isLast, totalCount }`
  - `previousJournalId` / `nextJournalId` are null at boundaries
  - 404 when journalId not found

### ED-008 — Company Select
- GET /reference/companies — same endpoint as ED-003; documented here for RC-008 coverage
- Test: company list response shape; 200 on valid request

## Schema Self-Validation Note
app/backend does not exist yet — no Zod schemas available at T-010 time.
Use literal test values that conform to expected BFF conventions:
- journalId: integer (e.g. `1`, `999`)
- accountCode: alphanumeric with hyphens (e.g. `"US-01-1000-100-01"`) — verify with A-05 during T-005
- Amounts: decimal numbers (e.g. `1000.00`, `0.00`)
- Dates: ISO 8601 strings (e.g. `"2026-05-23"`)
Note "seed.ts pending" in t010.spec.ts — A-05 writes seed.ts during T-005.

## Test Types Expected
- `unit` — isolated route handler / service logic (validation rules, error mapping)
- `integration` — supertest against route handlers (HTTP status codes, response shapes)
- `contract` — Pact consumer-driven contracts for FE↔BFF boundary
- `fuzz` — boundary/error paths on validation logic (mutual exclusion, balanced check, field lengths)

## Output Format
Each TC-BFF-###.md frontmatter:
```yaml
---
id: TC-BFF-###
ed-ref: ED-00#
rc-ref: RC-00#
type: unit | integration | contract | fuzz
priority: P1 | P2 | P3
automated: yes | no
---
```

## Spec Scaffolding (mandatory alongside TC-BFF cards)
File: `sprints\sprint-01\tests\bff\t010.spec.ts`
- One `describe()` per endpoint group (align with ED card groupings)
- One `it()` stub per TC-BFF card
- Stub body: arrange comment (build request from TC data) + supertest call + `expect(res.status).toBe(N)` (exact status from TC)
- Comment: `// seed.ts pending — A-05 writes factories during T-005`
- Do NOT leave stubs empty

## Key Error Cases to Cover (P1)
- POST /journal-entries: 422 on missing required fields (companyId, transactionDate, etc.)
- POST .../lines: 422 on debitAmount + creditAmount both > 0 (mutual exclusion)
- POST .../post: 422 when unbalanced; 409 when already Posted
- PUT /journal-entries/{id}: 404 on unknown ID; verify companyId is ignored/rejected in body
- DELETE .../lines/{lineId}: 204; verify parent JE totals updated
- GET /accounts/{accountCode}: 404 for unknown code; `isValid: false` for inactive

## DoD Checklist
- [ ] Every in-scope ED (ED-001..008) has ≥ 1 TC-BFF card
- [ ] All 4 test types present (unit, integration, contract, fuzz) across the set
- [ ] P1 error paths covered: 404, 409, 422 cases for each endpoint
- [ ] Mutual-exclusion (debit+credit) validated at BFF level
- [ ] Post-entry balance check (422 on unbalanced) covered
- [ ] `t010.spec.ts` written with non-empty stubs
- [ ] Write `.input-hash` to `sprints\sprint-01\tests\bff\test-cases\` after writing TCs
- [ ] Report task-complete to A-00 with TC count + endpoint coverage table
