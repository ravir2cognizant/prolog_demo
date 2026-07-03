---
id: TC-BFF-015
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-015 -- POST /journal-entries/{id}/post on Already-Posted Entry Returns 409 ALREADY_POSTED

## Test Objective
Verify that attempting to post an already-Posted journal entry returns 409 with code `ALREADY_POSTED`.

## Preconditions
- AUTH_DEV_BYPASS=1
- Post a JE successfully first (from TC-BFF-014 or equivalent)

## Test Steps
1. Create and post a balanced JE (as per TC-BFF-014)
2. Call `POST /journal-entries/{id}/post` a second time on the same ID
3. Assert `res.status === 409`
4. Assert `res.body.code === "ALREADY_POSTED"` or similar

## Expected Results
- 409 Conflict on double-post attempt

## Coverage Notes
Covers ED-004 Post error path (409 ALREADY_POSTED), RC-004 idempotency protection.
