---
id: TC-BFF-020
ed-ref: ED-008
rc-ref: RC-008
type: integration
priority: P2
automated: yes
---

# TC-BFF-020 -- POST /journal-entries/{id}/submit-for-approval Returns 200

## Test Objective
Verify that submitting an Unposted journal entry for approval returns 200 per ED-008.

## Preconditions
- AUTH_DEV_BYPASS=1
- Unposted JE exists with a routing value set

## Test Steps
1. Create a JE with `routing: "rr-supervisor"`
2. `POST /journal-entries/{id}/submit-for-approval`
3. Assert `res.status === 200`
4. Assert response indicates entry is now pending approval

## Expected Results
- 200 OK
- Entry status reflects pending approval state

## Coverage Notes
Covers ED-008 Submit for Approval, RC-008 FR-2/FR-3, AC-1.
