---
id: TC-BFF-030
ed-ref: ED-004
rc-ref: RC-004
type: fuzz
priority: P2
automated: yes
---

# TC-BFF-030 -- POST /journal-entries With Malformed Payloads Returns 400, Not 500

## Test Objective
Fuzz/boundary test: verify that malformed or unexpected request bodies on key mutation endpoints (POST /journal-entries, POST /accounts) are handled gracefully and return 400, never 500.

## Preconditions
- AUTH_DEV_BYPASS=1

## Test Steps
1. `POST /journal-entries` with `null` body → assert 400 or 415, NOT 500
2. `POST /journal-entries` with `"not an object"` (plain string) → assert 400
3. `POST /journal-entries` with `{ "companyId": 12345 }` (wrong type) → assert 400
4. `POST /journal-entries` with oversized description (501 chars) → assert 400
5. `POST /accounts` with `{ "type": "unknown-type" }` → assert 400

## Expected Results
- All malformed payloads return 4xx (not 500)
- Zod schema validation catches type errors and size violations
- No unhandled exceptions

## Coverage Notes
Boundary/fuzz coverage for ED-001 Create, ED-017 Create. Tests Zod schema enforcement and asyncHandler error catching. No 500s from malformed input is a correctness invariant.
