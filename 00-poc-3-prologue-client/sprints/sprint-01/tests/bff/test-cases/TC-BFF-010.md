---
id: TC-BFF-010
ed-ref: ED-002
rc-ref: RC-002
type: integration
priority: P1
automated: yes
---

# TC-BFF-010 -- GET /accounts?companyId= Returns Paginated Account List

## Test Objective
Verify that `GET /accounts?companyId=company-001` returns 200 with an `items` array containing account objects with `id`, `code`, `description`, `type`, `active` fields and pagination fields per ED-002.

## Preconditions
- seedStore() loaded with accounts for company-001
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /accounts?companyId=company-001`
2. Assert `res.status === 200`
3. Assert `res.body.items` is an array with length > 0
4. Assert `res.body.items[0]` has `id`, `code`, `description`, `type`, `active`
5. Assert `res.body.totalCount` is a number
6. Assert `res.body.page` is a number
7. Assert `res.body.pageSize` is a number

## Expected Results
- 200 OK with paginated accounts
- Field shape matches ED-002 response model

## Coverage Notes
Covers ED-002 Search Chart of Accounts, RC-002 FR-8 (account picker), RC-017 FR-4 (lookup).
