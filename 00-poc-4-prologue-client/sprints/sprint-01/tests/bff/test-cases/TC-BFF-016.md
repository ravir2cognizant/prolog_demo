---
id: TC-BFF-016
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-016 — POST /journal-entries/{journalId}/lines Creates Line; Returns 201

## Scenario
POST /journal-entries/{journalId}/lines adds a new line item and returns 201 with server-assigned lineId, lineNumber, and auto-populated accountDescription.

## Preconditions
- Seeded Unposted JE with journalId=1; seeded account "US-01-1000-100-01" → "Cash - US Operations"

## Steps
1. `POST /journal-entries/1/lines` with body:
   ```json
   {
     "accountCode": "US-01-1000-100-01",
     "currencyId": "USD",
     "debitAmount": 500.00,
     "creditAmount": 0.00
   }
   ```
2. Assert status 201
3. Assert response has `lineId` (integer > 0)
4. Assert `lineNumber` = 1 (first line)
5. Assert `accountDescription` = "Cash - US Operations"
6. Assert `debitAmount` = 500.00
7. Assert `creditAmount` = 0.00

## Expected Result
- `201 Created`
- lineId and lineNumber auto-assigned
- accountDescription auto-populated from account lookup

## Test Data
- journalId: 1; accountCode: "US-01-1000-100-01"; debitAmount: 500.00
