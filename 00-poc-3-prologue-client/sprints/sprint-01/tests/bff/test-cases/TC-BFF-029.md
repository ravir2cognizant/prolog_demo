---
id: TC-BFF-029
ed-ref: ED-017
rc-ref: RC-017
type: integration
priority: P1
automated: yes
---

# TC-BFF-029 -- POST /accounts Missing Required Fields Returns 400 VALIDATION_ERROR

## Test Objective
Verify that `POST /accounts` with missing required fields (code, description, type) returns 400 with `application/problem+json` and code `VALIDATION_ERROR`.

## Preconditions
- AUTH_DEV_BYPASS=1

## Test Steps
1. `POST /accounts` with `{ "companyId": "company-001" }` (missing code, description, type)
2. Assert `res.status === 400`
3. Assert `res.headers['content-type']` contains `application/problem+json`
4. Assert `res.body.code === "VALIDATION_ERROR"` or similar
5. Assert `res.body.status === 400`

## Expected Results
- 400 Bad Request with problem+json
- Indicates which required fields are missing

## Coverage Notes
Covers ED-017 Create Account error path, RC-017 AC-5 (missing required fields rejected).
