---
id: TC-BFF-018
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-018 — PUT /journal-entries/{journalId}/lines/{lineId} Updates Line; Returns 200

## Scenario
PUT /lines/{lineId} updates an existing line item and returns 200 with the updated LineItem.

## Preconditions
- Seeded Unposted JE with journalId=1, lineId=1 (debitAmount=500.00)

## Steps
1. `PUT /journal-entries/1/lines/1` with body:
   ```json
   { "debitAmount": 750.00, "description": "Updated line" }
   ```
2. Assert status 200
3. Assert response `debitAmount` = 750.00
4. Assert response `description` = "Updated line"
5. Assert `lineId` = 1 (unchanged)
6. Assert `lineNumber` unchanged

## Expected Result
- `200 OK`
- Updated fields reflected in response
- lineId and lineNumber unchanged

## Test Data
- journalId: 1, lineId: 1, original debitAmount: 500.00
