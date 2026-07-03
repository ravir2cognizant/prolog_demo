---
id: TC-BFF-014
ed-ref: ED-003
rc-ref: RC-008
type: integration
priority: P1
automated: yes
---

# TC-BFF-014 — GET /reference/companies Returns Company Array

## Scenario
GET /reference/companies returns 200 with an array of Company objects, each including companyId, companyName, and displayLabel.

## Preconditions
- BFF running; authenticated
- At least 2 companies seeded in reference data

## Steps
1. `GET /reference/companies` with valid Bearer token
2. Assert status 200
3. Assert response has `companies` array with ≥ 2 items
4. Assert `companies[0]` has: `companyId` (string), `companyName` (string), `displayLabel` (string)
5. Assert `displayLabel` = `"${companyId} - ${companyName}"` format

## Expected Result
- `200 OK`
- Company objects have correct shape
- `displayLabel` matches expected format

## Test Data
- Seeded: `{ companyId: "0004", companyName: "0004_company" }` and one more
