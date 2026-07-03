---
id: TC-BFF-027
ed-ref: ED-017
rc-ref: RC-017
type: integration
priority: P1
automated: yes
---

# TC-BFF-027 -- PUT /accounts/{id} Updates Account Description, Returns updatedAt

## Test Objective
Verify that `PUT /accounts/{id}` updates an existing account and returns 200 with `id`, `updatedAt`, `updatedByUserId` per ED-017.

## Preconditions
- AUTH_DEV_BYPASS=1
- Create an account first (TC-BFF-026 flow)

## Test Steps
1. Create an account, capture id
2. `PUT /accounts/{id}` with `{ "description": "Updated Description" }`
3. Assert `res.status === 200`
4. Assert `res.body.id` matches the account id
5. Assert `res.body.updatedAt` is a non-empty ISO string
6. Assert `res.body.updatedByUserId` is a non-empty string

## Expected Results
- 200 OK
- updatedAt and updatedByUserId set server-side

## Coverage Notes
Covers ED-017 Update Account, RC-017 FR-3 (edit existing).
