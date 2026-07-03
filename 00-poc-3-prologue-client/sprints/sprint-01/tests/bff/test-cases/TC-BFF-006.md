---
id: TC-BFF-006
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-006 -- PUT /journal-entries/{id} on Posted Entry Returns 409 ENTRY_POSTED

## Test Objective
Verify that attempting to update a Posted journal entry returns 409 with code ENTRY_POSTED per ED-001 error contract, enforcing RC-001 FR-7 (no editing posted entries).

## Preconditions
- seedStore() loaded with a Posted entry (e.g. id = 'je-seed-posted')
- AUTH_DEV_BYPASS=1

## Test Steps
1. Obtain a Posted entry ID (POST a JE then POST /post it, or use a seeded Posted entry)
2. `PUT /journal-entries/{id}` with `{ "description": "try to edit posted" }`
3. Assert `res.status === 409`
4. Assert `res.body.code === "ENTRY_POSTED"` or similar 4xx code

## Expected Results
- 409 Conflict
- Code indicating the entry is already posted

## Coverage Notes
Covers ED-001 Update error path (409 ENTRY_POSTED), RC-001 FR-7 (prevent editing posted entries), RC-004 FR-6.
