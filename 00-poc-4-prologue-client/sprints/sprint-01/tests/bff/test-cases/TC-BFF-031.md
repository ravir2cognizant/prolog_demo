---
id: TC-BFF-031
ed-ref: ED-007
rc-ref: RC-007
type: integration
priority: P1
automated: yes
---

# TC-BFF-031 — GET /navigation Returns 404 on Unknown journalId

## Scenario
GET /journal-entries/{journalId}/navigation with a journalId that does not exist returns 404.

## Preconditions
- journalId=99999 does not exist

## Steps
1. `GET /journal-entries/99999/navigation`
2. Assert status 404
3. Assert body: `{ "error": "Journal entry not found" }`

## Expected Result
- `404 Not Found`

## Test Data
- journalId: 99999
