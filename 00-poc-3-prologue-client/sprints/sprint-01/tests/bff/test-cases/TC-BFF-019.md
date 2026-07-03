---
id: TC-BFF-019
ed-ref: ED-007
rc-ref: RC-007
type: contract
priority: P2
automated: yes
---

# TC-BFF-019 -- GET /journal-entries/{id} Response Shape Includes All Audit Fields

## Test Objective
Contract test: verify that the GET single JE response includes all audit fields required by ED-007 / RC-007: `editedAt`, `editedByUserId`, `createdAt`, `createdByUserId`. Values must be non-null for a saved entry.

## Preconditions
- seedStore() loaded with at least one JE
- AUTH_DEV_BYPASS=1

## Test Steps
1. Create a new JE via POST
2. `GET /journal-entries/{id}`
3. Assert `res.body.editedAt` is a non-empty string (ISO 8601)
4. Assert `res.body.editedByUserId` is a non-empty string
5. Assert `res.body.createdAt` is a non-empty string
6. Assert `res.body.createdByUserId` is a non-empty string
7. Assert `editedAt` is a valid ISO 8601 datetime (contains 'T' and 'Z' or offset)

## Expected Results
- All four audit fields present and non-null
- editedAt is a valid ISO 8601 timestamp

## Coverage Notes
Covers ED-007 audit trail contract, RC-007 FR-1 (two read-only audit fields), FR-3 (timestamp precision), FR-5 (creation vs edit audit).
