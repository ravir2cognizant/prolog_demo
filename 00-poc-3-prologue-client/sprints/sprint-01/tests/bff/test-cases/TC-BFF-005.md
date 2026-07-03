---
id: TC-BFF-005
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-005 -- PUT /journal-entries/{id} Updates Unposted Entry and Returns editedAt

## Test Objective
Verify that `PUT /journal-entries/{id}` for an Unposted entry returns 200 with `id`, `editedAt`, and `editedByUserId`.

## Preconditions
- seedStore() loaded with an Unposted entry (e.g. id = 'je-seed-unposted')
- AUTH_DEV_BYPASS=1

## Test Steps
1. Create a new JE via POST to obtain a valid unposted ID
2. `PUT /journal-entries/{id}` with body `{ "description": "Updated description" }`
3. Assert `res.status === 200`
4. Assert `res.body.id` matches the entry ID
5. Assert `res.body.editedAt` is a non-empty ISO string
6. Assert `res.body.editedByUserId` is a non-empty string

## Expected Results
- 200 OK
- editedAt and editedByUserId set by server (RC-007 FR-2)

## Coverage Notes
Covers ED-001 Update Journal Entry Header, RC-001 AC-3 (audit fields updated on save), RC-007 FR-2.
