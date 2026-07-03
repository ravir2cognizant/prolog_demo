---
id: TC-FE-009
rc-ref: RC-003
ci-ref: CI-003
type: unit
priority: P1
automated: yes
---

# TC-FE-009 — JE Create Form Required Field Validation

## Scenario
Submitting the create form with missing required fields (Company ID, Journal Entry Type, Transaction Date, Description) shows inline validation errors and prevents submission.

## Preconditions
- JournalEntryForm rendered in create mode (no journalId)
- All fields empty

## Steps
1. Render `<JournalEntryForm mode="create" onSave={mockSave} onCancel={mockCancel} />`
2. Click the Save button without filling any fields
3. Assert `mockSave` was NOT called
4. Assert inline error messages appear adjacent to:
   - Company ID field: "Company is required"
   - Journal Entry Type field: "Journal entry type is required"
   - Transaction Date field: "Transaction date is required"
   - Description field: "Description is required"
5. Fill Company ID only; click Save again
6. Assert error still shows on Journal Entry Type, Transaction Date, Description
7. Assert no error on Company ID

## Expected Result
- Save blocked when required fields empty
- Inline error per missing field (adjacent to offending field, not in a banner)
- Errors clear individually as fields are filled

## Test Data
```ts
const mockCompanies = [{ companyId: '0004', companyName: '0004_company' }]
const mockTypes = [{ typeId: 'FJ', typeName: 'Finance Journal' }]
```
