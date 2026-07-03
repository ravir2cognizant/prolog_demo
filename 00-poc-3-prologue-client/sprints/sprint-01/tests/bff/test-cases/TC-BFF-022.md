---
id: TC-BFF-022
ed-ref: ED-008
rc-ref: RC-008
type: integration
priority: P2
automated: yes
---

# TC-BFF-022 -- POST /journal-entries/{id}/reject Requires rejectionReason, Returns 200

## Test Objective
Verify that rejecting a pending-approval JE with a `rejectionReason` body returns 200, and that rejecting without a reason returns 400.

## Preconditions
- AUTH_DEV_BYPASS=1
- JE submitted for approval

## Test Steps
**Scenario A — with reason:**
1. Submit JE for approval
2. `POST /journal-entries/{id}/reject` with `{ "rejectionReason": "Incorrect account code" }`
3. Assert `res.status === 200`

**Scenario B — without reason:**
1. Submit another JE for approval
2. `POST /journal-entries/{id}/reject` with empty body `{}`
3. Assert `res.status === 400`

## Expected Results
- With reason: 200 OK
- Without reason: 400 VALIDATION_ERROR

## Coverage Notes
Covers ED-008 Reject Journal Entry, RC-008 FR-5 (rejection reason mandatory), AC-3 (entry returns to Unposted with reason).
