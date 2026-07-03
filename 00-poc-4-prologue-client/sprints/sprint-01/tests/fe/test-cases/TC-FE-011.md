---
id: TC-FE-011
rc-ref: RC-003
ci-ref: CI-003
type: integration
priority: P1
automated: yes
---

# TC-FE-011 — JE Create Form Save via MSW Returns Journal ID

## Scenario
Filling and submitting the create form triggers POST /journal-entries; on 201 success the form receives journalId, journalNumber, and status from the response.

## Preconditions
- MSW handler registered: `POST /journal-entries → 201 { journalId: 42, journalNumber: 1001, status: 'Unposted', editDateTime: '...', editUserId: 'User1' }`
- Companies and types reference data mocked

## Steps
1. Render JournalEntryForm in create mode with MSW active
2. Select Company "0004 - 0004_company"
3. Select Type "Finance Journal"
4. Set Transaction Date to "2026-05-23"
5. Enter Description "Payroll Accrual"
6. Click Save
7. Assert POST /journal-entries was called with correct body
8. Assert `onSave` callback received `{ journalId: 42, journalNumber: 1001 }`
9. Assert Edit Date/Time and Edit User ID are populated from response

## Expected Result
- POST called with `{ companyId: '0004', journalEntryTypeId: 'FJ', transactionDate: '2026-05-23', description: 'Payroll Accrual' }`
- Save callback fires with response data
- Save completes within 2000ms (RC-003 NFR)

## Test Data
- MSW mock returning 201 as above
