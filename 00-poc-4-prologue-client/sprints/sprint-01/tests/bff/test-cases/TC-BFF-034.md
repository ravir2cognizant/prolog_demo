---
id: TC-BFF-034
ed-ref: ED-008
rc-ref: RC-008
type: contract
priority: P2
automated: yes
---

# TC-BFF-034 — Pact Contract for Company Reference Data Shape

## Scenario
Consumer-driven contract verifying BFF GET /reference/companies response shape matches FE CompanyIdSelect expectations.

## Preconditions
- Pact consumer contract from FE tests

## Steps
1. Run Pact provider verification for GET /reference/companies
2. Verify `companies[*].companyId` (string), `companyName` (string), `displayLabel` (string)
3. Assert all Pact interactions pass

## Expected Result
- All Pact interactions verified for company shape

## Test Data
- Pact contract from FE consumer tests
