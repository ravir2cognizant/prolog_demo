---
id: TC-BFF-028
ed-ref: ED-006
rc-ref: RC-006
type: fuzz
priority: P1
automated: yes
---

# TC-BFF-028 — Audit Fields Rejected in Any Request Body

## Scenario
No API endpoint accepts user-provided audit field values (editDateTime, editUserId, postedDateTime, posterUserId). These are server-populated only (ED-006 design note; RC-006 security requirement).

## Preconditions
- BFF running; authenticated

## Steps
1. `POST /journal-entries` with extra `editDateTime: "2020-01-01T00:00:00Z"` in body
   → assert 201 but response `editDateTime` is server-generated (not "2020-01-01T00:00:00Z")
2. `PUT /journal-entries/1` with extra `editUserId: "hacker"` in body
   → assert 200 but response `editUserId` reflects authenticated user (not "hacker")
3. `POST /journal-entries/1/post` with body `{ "postedDateTime": "2020-01-01T00:00:00Z" }`
   → assert 200 but `postedDateTime` is server-generated

## Expected Result
- Audit fields silently ignored in request body
- Server-generated values always used

## Test Data
- Payloads injecting audit field values
