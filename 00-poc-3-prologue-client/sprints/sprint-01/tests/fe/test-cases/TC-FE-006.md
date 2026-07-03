---
id: TC-FE-006
rc-ref: RC-005
type: unit
priority: P2
automated: yes
---

# TC-FE-006 -- Auto-Reversal: Reverse Button Opens Modal and Calls POST /reverse

## Test Objective
Verify that clicking the Reverse action on a posted journal entry opens a confirmation modal that accepts a reversal date, and on confirmation calls `POST /journal-entries/{id}/reverse`.

## Preconditions
- JournalEntryPage loaded in edit mode with a Posted entry (id = 'je-posted')
- `apiClient.POST` mocked for `/journal-entries/je-posted/reverse`
- Radix Dialog renders correctly in jsdom

## Test Steps
1. Render JournalEntryPage with Posted entry
2. Click "Reverse" button (should be visible for Posted entries)
3. Assert a dialog/modal opens with a reversal date input
4. Enter reversal date "2026-06-01"
5. Click "Confirm Reversal" button
6. Assert `apiClient.POST` was called with path `/journal-entries/je-posted/reverse`
7. Assert the modal closes after confirmation

## Expected Results
- Reverse button visible for Posted entries
- Modal appears with a date input on click
- Confirming calls the reverse endpoint with the entered date
- Modal dismisses on success

## Coverage Notes
Covers RC-005 FR-1 (Auto Reversal Date field), FR-2 (reversing entry created on date), FR-4 (reversal is Unposted), AC-1 (reversal date stored/displayed).
Note: Full auto-reversal scheduling is server-side; this TC covers the UI trigger flow.
