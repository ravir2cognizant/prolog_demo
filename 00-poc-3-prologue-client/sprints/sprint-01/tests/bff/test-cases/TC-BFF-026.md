---
id: TC-BFF-026
ed-ref: ED-017
rc-ref: RC-017
type: integration
priority: P1
automated: yes
---

# TC-BFF-026 -- POST /accounts Creates Account, Returns 201 with id

## Test Objective
Verify that `POST /accounts` with valid payload creates a GL account and returns 201 with the new account's `id`, per ED-017.

## Preconditions
- AUTH_DEV_BYPASS=1
- seedStore() loaded

## Test Steps
1. `POST /accounts` with body:
   ```json
   {
     "companyId": "company-001",
     "code": "1-TEST-0001-000-00",
     "description": "TC-BFF-026 Test Account",
     "type": "asset",
     "active": true
   }
   ```
2. Assert `res.status === 201`
3. Assert `res.body.id` is a non-empty string
4. Assert `res.body.code === "1-TEST-0001-000-00"`

## Expected Results
- 201 Created
- New account ID returned
- Code matches input

## Coverage Notes
Covers ED-017 Create Account, RC-017 FR-2 (create with required fields), AC-2 (new account appears in picker).
