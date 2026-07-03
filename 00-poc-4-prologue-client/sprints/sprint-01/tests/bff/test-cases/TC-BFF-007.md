---
id: TC-BFF-007
ed-ref: ED-002
rc-ref: RC-002
type: contract
priority: P2
automated: yes
---

# TC-BFF-007 — Pact Contract for JE Header Response Shape

## Scenario
Consumer-driven contract verifying BFF JE header response matches FE expectations including all 16 fields and nested `lines`/`totals` objects.

## Preconditions
- Pact consumer contract from FE tests

## Steps
1. Run Pact provider verification for GET /journal-entries/{journalId}
2. Verify all 16 header fields, `lines[*]` shape, and `totals` shape
3. Assert all interactions pass

## Expected Result
- All Pact interactions verified
- No type mismatches on `balanced` (boolean), `totals.totalDebits` (number), etc.

## Test Data
- Pact contract (generated during T-011)
