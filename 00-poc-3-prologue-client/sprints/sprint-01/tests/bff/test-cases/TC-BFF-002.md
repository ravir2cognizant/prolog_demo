---
id: TC-BFF-002
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-002 -- GET /journal-entries/{id} Returns Full Entry Including Lines and Audit Fields

## Test Objective
Verify that `GET /journal-entries/{id}` returns 200 with the full journal entry object including all header fields, lines array, and audit fields (editedAt, editedByUserId, createdAt, createdByUserId).

## Preconditions
- seedStore() provides at least one journal entry (e.g. id = 'je-seed-001')
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /journal-entries/je-seed-001` via supertest
2. Assert `res.status === 200`
3. Assert `res.body.id === 'je-seed-001'`
4. Assert `res.body` has: `companyId`, `entryType`, `status`, `transactionDate`, `description`
5. Assert `res.body.lines` is an array
6. Assert `res.body` has `editedAt` and `editedByUserId`
7. Assert `res.body` has `createdAt` and `createdByUserId`

## Expected Results
- 200 OK with full response shape matching ED-001 response model
- Audit fields present and non-null

## Coverage Notes
Covers ED-001 Get Journal Entry response contract, RC-007 FR-1 (audit fields always visible).
