---
id: TC-BFF-011
ed-ref: ED-002
rc-ref: RC-002
type: integration
priority: P1
automated: yes
---

# TC-BFF-011 -- GET /accounts?activeOnly=true Excludes Inactive Accounts

## Test Objective
Verify that adding `activeOnly=true` to the accounts query excludes inactive accounts, so the journal entry line account picker only shows active accounts per RC-017 FR-6.

## Preconditions
- seedStore() includes at least one inactive account for company-001
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /accounts?companyId=company-001&activeOnly=false` — note total count with inactives
2. `GET /accounts?companyId=company-001&activeOnly=true` — assert count is less or equal
3. Assert none of the items in the activeOnly=true response have `active: false`

## Expected Results
- activeOnly=true response contains only items with `active: true`
- Count is ≤ the activeOnly=false count

## Coverage Notes
Covers ED-002 activeOnly filter, RC-002 FR-7 (multi-currency / activeOnly), RC-017 FR-6 (inactive accounts excluded from picker).
