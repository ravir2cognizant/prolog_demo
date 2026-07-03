---
id: TC-BFF-012
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-012 — PUT /journal-entries/{journalId} Returns 403 on Posted Entry

## Scenario
PUT /journal-entries/{journalId} on a Posted entry returns 403 — posted entries cannot be edited.

## Preconditions
- Seeded Posted JE with journalId=2

## Steps
1. `PUT /journal-entries/2` with body: `{ "description": "Attempted edit" }`
2. Assert status 403
3. Assert response body: `{ "error": "Forbidden" }`

## Expected Result
- `403 Forbidden`
- No changes made to the Posted entry

## Test Data
- journalId: 2 (seeded Posted JE)
