---
id: TC-BFF-018
ed-ref: ED-006
rc-ref: RC-006
type: integration
priority: P2
automated: yes
---

# TC-BFF-018 -- GET /journal-entries Returns isFirst and isLast Flags for Navigation

## Test Objective
Verify that the list response includes `isFirst` and `isLast` boolean flags for cursor-based navigation per ED-006 / ED-001 list response model, covering RC-006 navigation button enable/disable logic.

## Preconditions
- seedStore() loaded with at least one JE for company-001
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /journal-entries?companyId=company-001`
2. Assert `res.body.isFirst` is a boolean
3. Assert `res.body.isLast` is a boolean
4. With small seed data (1-2 entries), assert `isFirst === true && isLast === true` (single page)

## Expected Results
- isFirst and isLast present in response
- Correct values for single-page result set

## Coverage Notes
Covers ED-006 navigation flags, RC-006 FR-3 (Previous disabled at first), FR-4 (Next disabled at last).
