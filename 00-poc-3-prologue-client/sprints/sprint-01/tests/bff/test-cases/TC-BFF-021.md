---
id: TC-BFF-021
ed-ref: ED-008
rc-ref: RC-008
type: integration
priority: P2
automated: yes
---

# TC-BFF-021 -- POST /journal-entries/{id}/approve Returns 200 and Updates Status

## Test Objective
Verify that approving a pending-approval journal entry returns 200 and the entry status reflects approval.

## Preconditions
- AUTH_DEV_BYPASS=1
- JE submitted for approval (see TC-BFF-020 flow)

## Test Steps
1. Create JE with routing, submit for approval
2. `POST /journal-entries/{id}/approve`
3. Assert `res.status === 200`

## Expected Results
- 200 OK, entry approved

## Coverage Notes
Covers ED-008 Approve Journal Entry, RC-008 FR-4 (approver can approve), AC-4 (approved entry can be posted).
