---
id: TC-BFF-004
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-004 -- POST /journal-entries Validation Failure Returns 400 problem+json

## Test Objective
Verify that `POST /journal-entries` with missing required fields returns 400 with `Content-Type: application/problem+json` and a body containing `status`, `code`, and error detail per ED-001 error contract.

## Preconditions
- AUTH_DEV_BYPASS=1

## Test Steps
1. `POST /journal-entries` with body `{ "description": "missing required fields" }`
2. Assert `res.status === 400`
3. Assert `res.headers['content-type']` contains `application/problem+json`
4. Assert `res.body.status === 400`
5. Assert `res.body.code` is a non-empty string (e.g. "VALIDATION_ERROR")

## Expected Results
- 400 Bad Request
- problem+json content type
- Body has status + code fields

## Coverage Notes
Covers ED-001 Create error path (400 VALIDATION_ERROR). Already covered by existing api.spec.ts but included here for plan completeness. This is the only currently-automated BFF test case.
