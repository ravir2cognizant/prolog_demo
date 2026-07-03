---
id: TC-BFF-008
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P2
automated: yes
---

# TC-BFF-008 -- GET /journal-entry-types Returns Items with code and name

## Test Objective
Verify that `GET /journal-entry-types` returns 200 with `items` array containing objects with `code` and `name` fields per ED-001.

## Preconditions
- seedStore() loaded
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /journal-entry-types`
2. Assert `res.status === 200`
3. Assert `res.body.items` is an array with length > 0
4. Assert each item has `code` (string) and `name` (string)

## Expected Results
- 200 OK, items array with code + name on each entry

## Coverage Notes
Covers ED-001 List Journal Entry Types, RC-001 FR-4.
