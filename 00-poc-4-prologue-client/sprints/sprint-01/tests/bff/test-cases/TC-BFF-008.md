---
id: TC-BFF-008
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-008 — POST /journal-entries Creates JE; Returns 201 with Required Fields

## Scenario
POST /journal-entries with a valid request body creates a new journal entry and returns 201 with journalId, journalNumber, status="Unposted", editDateTime, editUserId.

## Preconditions
- BFF running; authenticated user has create access to company "0004"
- Company "0004" and type "FJ" exist in reference data

## Steps
1. `POST /journal-entries` with body:
   ```json
   {
     "companyId": "0004",
     "journalEntryType": "FJ",
     "transactionDate": "2026-05-23",
     "description": "Payroll Accrual"
   }
   ```
2. Assert status 201
3. Assert response has `journalId` (integer > 0)
4. Assert response has `journalNumber` (integer > 0)
5. Assert `status` = "Unposted"
6. Assert `editDateTime` is a valid ISO 8601 datetime
7. Assert `editUserId` matches authenticated user

## Expected Result
- `201 Created`
- All 5 required response fields present and correctly typed

## Test Data
- companyId: "0004", journalEntryType: "FJ", transactionDate: "2026-05-23", description: "Payroll Accrual"
