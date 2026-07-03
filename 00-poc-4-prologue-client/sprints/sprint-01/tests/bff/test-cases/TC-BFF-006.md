---
id: TC-BFF-006
ed-ref: ED-002
rc-ref: RC-002
type: fuzz
priority: P2
automated: yes
---

# TC-BFF-006 — GET /journal-entries/{journalId} Returns 400 on Non-Integer ID

## Scenario
GET /journal-entries/{journalId} with a non-integer path parameter (e.g. "abc", "1.5", "null") returns 400.

## Preconditions
- BFF running

## Steps
1. `GET /journal-entries/abc` → assert 400
2. `GET /journal-entries/1.5` → assert 400
3. `GET /journal-entries/-1` → assert 400 or 404 (negative ID not valid)
4. `GET /journal-entries/0` → assert 400 or 404

## Expected Result
- Non-integer IDs: `400 Bad Request`
- Negative/zero IDs: `400 Bad Request`

## Test Data
- journalId variants: "abc", "1.5", "-1", "0", "null"
