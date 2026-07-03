---
id: TC-BFF-021
ed-ref: ED-004
rc-ref: RC-004
type: fuzz
priority: P1
automated: yes
---

# TC-BFF-021 — GET /accounts/{accountCode} Returns 400 on Invalid Format

## Scenario
GET /accounts/{accountCode} with an account code that does not match the 5-segment format "S1-S2-S3-S4-S5" returns 400.

## Preconditions
- BFF running; authenticated

## Steps
1. `GET /accounts/INVALID` (no hyphens) → assert 400
2. `GET /accounts/US-01-1000` (3 segments only) → assert 400
3. `GET /accounts/US-01-1000-100-01-EXTRA` (6 segments) → assert 400

## Expected Result
- Invalid format: `400 Bad Request` with `{ "error": "Invalid account code format", "field": "accountCode" }`

## Test Data
- "INVALID", "US-01-1000", "US-01-1000-100-01-EXTRA"
