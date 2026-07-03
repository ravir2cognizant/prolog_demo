---
id: TC-BFF-025
ed-ref: ED-016
rc-ref: RC-016
type: integration
priority: P2
automated: yes
---

# TC-BFF-025 -- GET /routing-rules Returns Items with id, name, description

## Test Objective
Verify that `GET /routing-rules` returns 200 with items containing `id`, `name`, `description` per ED-016 / shell.routes.ts implementation.

## Preconditions
- seedStore() loaded with routing rules
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /routing-rules`
2. Assert `res.status === 200`
3. Assert `res.body.items` is an array with length > 0
4. Assert each item has `id`, `name`, `description`

## Expected Results
- 200 OK with routing rules
- Field shape as implemented in shell.routes.ts

## Coverage Notes
Covers ED-016 routing rules list, RC-008 FR-1/FR-2 (routing field populated from rules), RC-016 routing administration.
Note: CR-005 finding — this endpoint is unauthenticated (mounted before authn middleware). This is by design for POC.
