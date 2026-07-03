---
id: TC-BFF-005
ed-ref: ED-002
rc-ref: RC-002
type: integration
priority: P1
automated: yes
---

# TC-BFF-005 — GET /journal-entries/{journalId} Returns 404 When JE Not Found

## Scenario
GET /journal-entries/{journalId} with a journalId that does not exist returns 404.

## Preconditions
- BFF running; journalId=99999 does not exist in database

## Steps
1. `GET /journal-entries/99999` with valid Bearer token
2. Assert status 404
3. Assert response body: `{ "error": "Journal entry not found" }`

## Expected Result
- `404 Not Found`
- Error message matches spec

## Test Data
- journalId: 99999 (non-existent)
