---
id: TC-BFF-007
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-007 -- GET /companies Returns Items Array with id, name, active Fields

## Test Objective
Verify that `GET /companies` returns 200 with an `items` array where each element has `id`, `name`, and `active` fields per ED-001 response model.

## Preconditions
- seedStore() loaded (companies seeded)
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /companies` via supertest
2. Assert `res.status === 200`
3. Assert `res.body.items` is an array with length > 0
4. Assert `res.body.items[0]` has `id`, `name`, `active`

## Expected Results
- 200 OK
- At least one company in seeded store
- Each item has the three required fields

## Coverage Notes
Covers ED-001 List Companies response contract, RC-001 FR-3 (companies available to user).
