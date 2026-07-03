---
id: TC-BFF-002
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-002 — GET /navigation/menu Returns 401 Without Auth Token

## Scenario
An unauthenticated request to GET /navigation/menu is rejected with 401.

## Preconditions
- BFF running; no auth token provided

## Steps
1. `GET /navigation/menu` without Authorization header
2. Assert status 401
3. Assert response body: `{ "error": "Unauthorised" }`

## Expected Result
- `401 Unauthorized`
- Error body present

## Test Data
- No token
