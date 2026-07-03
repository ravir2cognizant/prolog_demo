---
id: TR-BFF-002
tc-ref: TC-BFF-002
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-002 -- GET /journal-entries/{id} Full Entry

## Verdict: PASS

## Evidence
```
✓ TC-BFF-002: GET /journal-entries/{id} full entry > returns 200 with full entry including audit fields
✓ TC-BFF-002: GET /journal-entries/{id} full entry > returns 404 for unknown id
```
GET /journal-entries/je-seed-001 returned 200 with `id`, `companyId`, `status`, `lines` array, audit fields.
GET /journal-entries/nonexistent-id returned 404.

## Notes
Two sub-cases tested. Both pass.
