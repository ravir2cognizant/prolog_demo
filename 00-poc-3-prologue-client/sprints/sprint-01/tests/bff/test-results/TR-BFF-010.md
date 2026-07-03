---
id: TR-BFF-010
tc-ref: TC-BFF-010
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-010 -- GET /accounts Pagination

## Verdict: PASS

## Evidence
```
✓ TC-BFF-010: GET /accounts pagination > returns items with id, code, description, type, active and pagination fields
```
GET /accounts?companyId=comp-001&page=1&pageSize=10 returned 200 with `items` array having `id`, `code`, `description`, `type`, `active` fields plus `totalCount`, `page`, `pageSize`.

## Notes
10 seed accounts (acct-001 to acct-010) for comp-001. Pagination confirmed.
