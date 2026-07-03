---
id: TC-BFF-028
ed-ref: ED-017
rc-ref: RC-017
type: integration
priority: P1
automated: yes
---

# TC-BFF-028 -- GET /accounts/{id}/balances Returns Period Array for Fiscal Year

## Test Objective
Verify that `GET /accounts/{id}/balances?fiscalYearId=fy-2026` returns 200 with a `periods` array containing period balance objects per ED-017.

## Preconditions
- AUTH_DEV_BYPASS=1
- seedStore() provides accounts and fiscal year data

## Test Steps
1. Get a seeded account id (from GET /accounts?companyId=company-001)
2. `GET /accounts/{id}/balances?fiscalYearId=fy-2026`
3. Assert `res.status === 200`
4. Assert `res.body.accountId === {id}`
5. Assert `res.body.periods` is an array
6. If periods is non-empty, assert each period has `periodId`, `openingBalance`, `debit`, `credit`, `closingBalance`

## Expected Results
- 200 OK
- accountId present
- periods array (may be empty for seed data)

## Coverage Notes
Covers ED-017 Get Account Balances by Period, RC-017 FR-5 (account inquiry shows balance by period), AC-4.
