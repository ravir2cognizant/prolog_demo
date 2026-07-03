---
id: TC-FE-005
rc-ref: RC-002
ci-ref: CI-002
type: unit
priority: P1
automated: yes
---

# TC-FE-005 — JE Header Displays All 16 Fields; Optional Fields Shown When Empty

## Scenario
JournalEntryHeader (read mode) renders all 16 required fields. Optional fields are visible even when their values are null/empty.

## Preconditions
- JE header data with some optional fields null (Auto Reversal Date, Posting Session, Allocation Method ID)
- Entry status: "Unposted"

## Steps
1. Render `<JournalEntryHeader journalEntry={unpostedJE} />`
2. Assert all 16 field labels are present:
   Company ID, Journal Entry Type, Journal Number, Status, Transaction Date,
   Edit Date/Time, Auto Reversal Date, Edit User ID, Description, Posting Session,
   Source Document, GL Import, Allocation Method ID, Balanced, Posted Date/Time, Poster User ID
3. Assert Company ID displays as `"0004 - 0004_company"` (code + name format)
4. Assert Auto Reversal Date field is visible with empty value (not hidden)
5. Assert Posting Session field is visible with empty value (not hidden)
6. Assert Allocation Method ID field is visible with empty value (not hidden)

## Expected Result
- All 16 field label-value pairs rendered in the DOM
- Company ID shows `"0004 - 0004_company"` (AC-4 RC-002)
- Optional empty fields shown — not hidden or removed

## Test Data
```ts
const unpostedJE = {
  journalId: 1, companyId: '0004', companyName: '0004_company',
  journalEntryType: 'Finance Journal', journalNumber: 1001,
  status: 'Unposted', transactionDate: '2026-05-23',
  editDateTime: '2026-05-23T10:00:00Z', editUserId: 'User1',
  autoReversalDate: null, description: 'Test JE', postingSession: null,
  sourceDocument: null, glImport: null, allocationMethodId: null,
  balanced: false, postedDateTime: null, posterUserId: null,
}
```
