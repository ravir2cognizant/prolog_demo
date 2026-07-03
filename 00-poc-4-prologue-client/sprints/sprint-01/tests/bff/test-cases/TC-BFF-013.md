---
id: TC-BFF-013
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-013 — PUT /journal-entries/{journalId} Rejects companyId in Request Body

## Scenario
PUT /journal-entries/{journalId} silently ignores or rejects companyId in the request body — company is locked post-creation (ED-003 design note, OQ-004b conservative default).

## Preconditions
- Seeded Unposted JE with journalId=1, companyId="0004"

## Steps
1. `PUT /journal-entries/1` with body: `{ "companyId": "0005", "description": "Test" }`
2. Assert status 200 (update succeeds for mutable fields)
3. `GET /journal-entries/1` → assert `companyId` still = "0004" (unchanged)

## Expected Result
- `200 OK` for valid mutable fields
- companyId not changed — stays "0004"

## Test Data
- journalId: 1; original companyId: "0004"; attempted change to "0005"
