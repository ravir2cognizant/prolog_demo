---
id: TC-BFF-033
ed-ref: ED-008
rc-ref: RC-008
type: integration
priority: P1
automated: yes
---

# TC-BFF-033 — GET /reference/companies Returns 200 with Correct Company Shape

## Scenario
GET /reference/companies (documented in both ED-003 and ED-008) returns 200 with Company objects in the correct shape for the company selector dropdown.

## Preconditions
- BFF running; authenticated
- At least 2 companies seeded

## Steps
1. `GET /reference/companies`
2. Assert status 200
3. Assert `companies` is an array with ≥ 2 items (RC-008 FR-5 multi-company)
4. Assert each company has: `companyId` (string), `companyName` (string), `displayLabel` (string)
5. Assert `displayLabel` exactly matches `"${companyId} - ${companyName}"` for each entry
6. Assert only companies the authenticated user can access are returned (user-scoped)

## Expected Result
- `200 OK`
- Correct company shape with displayLabel in expected format

## Test Data
- Seeded companies: "0004 - 0004_company" and "0005 - Alpha Corp"
