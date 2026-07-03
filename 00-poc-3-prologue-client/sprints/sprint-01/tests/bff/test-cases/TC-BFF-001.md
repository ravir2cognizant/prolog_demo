---
id: TC-BFF-001
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-001 -- GET /journal-entries Returns Paginated List with Cursor Fields

## Test Objective
Verify that `GET /journal-entries?companyId=company-001` returns 200 with a response body containing `items` array, `totalCount`, `isFirst`, and `isLast` pagination flags per ED-001 / ED-006 list contract.

## Preconditions
- Backend app started with `seedStore()` (seeded data in memory store)
- `AUTH_DEV_BYPASS=1` (dev-auth bypass, skips JWT validation)

## Test Steps
1. `GET /journal-entries?companyId=company-001` via supertest
2. Assert `res.status === 200`
3. Assert `res.body.items` is an array
4. Assert `res.body.totalCount` is a number ≥ 0
5. Assert `res.body` has `isFirst` (boolean) and `isLast` (boolean)

## Expected Results
- 200 OK
- `items` array present (may be empty if no seed entries for company-001)
- Pagination flags present

## Coverage Notes
Covers ED-001 list path, ED-006 FR-1 (cursor navigation result set), RC-001 BFF contract for list view.
