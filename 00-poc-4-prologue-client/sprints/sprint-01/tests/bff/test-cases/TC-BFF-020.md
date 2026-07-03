---
id: TC-BFF-020
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-020 — GET /accounts/{accountCode} Returns Account Details; 404 on Unknown

## Scenario
GET /accounts/{accountCode} returns 200 with account details for a valid code; returns 404 for an unknown code.

## Preconditions
- Seeded account "US-01-1000-100-01" → "Cash - US Operations", isValid=true

## Steps
### Valid account:
1. `GET /accounts/US-01-1000-100-01`
2. Assert status 200
3. Assert `accountCode` = "US-01-1000-100-01"
4. Assert `accountDescription` = "Cash - US Operations"
5. Assert `isValid` = true
6. Assert `segment1` = "US"

### Unknown account:
7. `GET /accounts/XX-99-9999-999-99`
8. Assert status 404
9. Assert `{ "error": "Account not found" }`

## Expected Result
- Valid: `200 OK` with complete AccountDetails object
- Unknown: `404 Not Found`

## Test Data
- Valid: "US-01-1000-100-01"; Unknown: "XX-99-9999-999-99"
