---
id: TC-BFF-013
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-013 -- POST /journal-entries/{id}/post on Unbalanced Entry Returns 400 ENTRY_NOT_BALANCED

## Test Objective
Verify that posting an unbalanced journal entry (totalDebit ≠ totalCredit) is rejected with 400 and code `ENTRY_NOT_BALANCED` per ED-004 (which enforces ED-003 balance rule).

## Preconditions
- AUTH_DEV_BYPASS=1
- Create an unbalanced JE first: one line with debit=500, no credit line

## Test Steps
1. `POST /journal-entries` with one line: debit=500, credit=0 (unbalanced)
2. Capture returned `id`
3. `POST /journal-entries/{id}/post`
4. Assert `res.status === 400`
5. Assert `res.body.code === "ENTRY_NOT_BALANCED"` or similar validation code

## Expected Results
- 400 on post attempt
- ENTRY_NOT_BALANCED or equivalent code

## Coverage Notes
Covers ED-003 balance enforcement, ED-004 Post error path, RC-003 FR-4 (prevent posting unbalanced), RC-004 FR-5.
