---
id: TC-FE-022
rc-ref: RC-003
type: unit
priority: P1
automated: yes
---

# TC-FE-022 -- Unbalanced Entry Blocks Save: Zod Validation Error Displayed

## Test Objective
Verify that submitting a journal entry with unbalanced lines (debit ≠ credit) is blocked by client-side Zod validation and an inline error message is displayed.

## Preconditions
- JournalEntryPage rendered in create mode
- No API call should be made if validation fails

## Test Steps
1. Render JournalEntryPage in create mode
2. Fill in all required header fields (Company, Type, Date, Description)
3. Set line 1: Debit = "500.00", Credit = "0.00"
4. Set line 2: Debit = "0.00", Credit = "300.00"  (difference = $200)
5. Click Save button
6. Assert `apiClient.POST` was NOT called
7. Assert an error message containing "balanced" or "not equal" is shown in the UI

## Expected Results
- Save is blocked when debit total ≠ credit total
- Inline error message visible (client-side, no server round-trip)
- No API call made

## Coverage Notes
Covers RC-003 FR-5 (prevent saving unbalanced entry with inline message), AC-3 (block post on unbalanced). This TC covers the save-block path; posting block is covered by TC-FE-005.
