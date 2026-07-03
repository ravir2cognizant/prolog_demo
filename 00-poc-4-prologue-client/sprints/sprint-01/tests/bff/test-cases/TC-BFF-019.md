---
id: TC-BFF-019
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-019 — DELETE /journal-entries/{journalId}/lines/{lineId} Returns 204

## Scenario
DELETE /lines/{lineId} deletes the line item and returns 204 No Content.

## Preconditions
- Seeded Unposted JE with journalId=1, lineId=1

## Steps
1. `DELETE /journal-entries/1/lines/1`
2. Assert status 204
3. Assert response body is empty
4. `GET /journal-entries/1/lines` → assert lineId=1 no longer in lines array

## Expected Result
- `204 No Content`
- Line removed from JE

## Test Data
- journalId: 1, lineId: 1
