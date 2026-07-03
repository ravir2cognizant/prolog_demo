---
id: TC-BFF-017
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-017 — POST /journal-entries/{journalId}/lines Returns 400 When Debit AND Credit Both > 0

## Scenario
POST /lines rejects a line item that has both debitAmount > 0 and creditAmount > 0 (mutual exclusion rule, ED-004).

## Preconditions
- Seeded Unposted JE with journalId=1

## Steps
1. `POST /journal-entries/1/lines` with body:
   ```json
   {
     "accountCode": "US-01-1000-100-01",
     "currencyId": "USD",
     "debitAmount": 100.00,
     "creditAmount": 200.00
   }
   ```
2. Assert status 400
3. Assert response body includes error message about mutual exclusion

## Expected Result
- `400 Bad Request`
- Both debit and credit > 0 rejected

## Test Data
- debitAmount: 100.00, creditAmount: 200.00 (both > 0)
