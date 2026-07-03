---
id: TR-BFF-001
tc-ref: TC-BFF-001
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-001 -- GET /journal-entries Cursor Page

## Verdict: PASS

## Evidence
```
✓ TC-BFF-001: GET /journal-entries cursor page > returns 200 with items, totalCount, isFirst, isLast
```
GET /journal-entries?companyId=comp-001 returned 200 with `items` array, `totalCount` number, `isFirst` boolean, `isLast` boolean.

## Notes
Seed data (je-seed-001, je-seed-002) present via seedStore(). Cursor pagination fields confirmed.
