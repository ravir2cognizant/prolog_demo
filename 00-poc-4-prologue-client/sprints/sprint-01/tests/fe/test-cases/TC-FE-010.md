---
id: TC-FE-010
rc-ref: RC-003
ci-ref: CI-003
type: unit
priority: P1
automated: yes
---

# TC-FE-010 — Company Locked in Edit Mode; Posted Entry is Read-Only

## Scenario
In edit mode, Company ID is disabled (OQ-004b conservative default). In view/edit mode for a Posted entry, all editable fields are read-only.

## Preconditions
- JournalEntryForm with an existing unposted JE (edit mode)
- JournalEntryForm with a posted JE

## Steps
### Edit mode (unposted):
1. Render `<JournalEntryForm mode="edit" journalEntry={unpostedJE} />`
2. Assert CompanyIdSelect has `disabled` attribute
3. Assert Journal Entry Type select is NOT disabled
4. Assert Description input is NOT disabled

### Posted entry (read-only):
5. Render `<JournalEntryForm mode="view" journalEntry={postedJE} />`
6. Assert all form fields are disabled or read-only
7. Assert Save button is not present or is disabled

## Expected Result
- Edit mode: only CompanyIdSelect is disabled; other fields editable
- Posted/view mode: all fields read-only; no save action available

## Test Data
```ts
const unpostedJE = { journalId: 1, companyId: '0004', status: 'Unposted', ... }
const postedJE = { journalId: 2, companyId: '0004', status: 'Posted', ... }
```
