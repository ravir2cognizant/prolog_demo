---
id: TC-FE-003
rc-ref: RC-002
type: unit
priority: P1
automated: yes
---

# TC-FE-003 -- Journal Entry Lines Grid: Add Line, Delete Line, Re-sequence

## Test Objective
Verify that the JournalEntryPage lines grid supports adding new lines (with sequential line numbers), entering debit/credit values, and deleting lines. Covers RC-002 FR-1, FR-4, FR-5, FR-6, AC-1.

## Preconditions
- JournalEntryPage rendered in create mode
- At least the 2 default lines are present (useFieldArray initialises with min 2)
- `apiClient` mocked

## Test Steps
1. Assert initial 2 lines are shown (line numbers 1, 2)
2. Click "Add Line" button
3. Assert a 3rd line appears with line number 3
4. In line 3, enter Account field value "1000-Cash", Debit "500.00", Credit "0.00"
5. Click the delete button on line 2
6. Assert only 2 lines remain
7. Assert remaining lines are renumbered 1, 2 (re-sequence)

## Expected Results
- After Add Line: 3 rows in the lines grid
- After Delete: 2 rows remain
- Line numbers are contiguous (no gaps)
- Debit/credit inputs accept numeric values

## Coverage Notes
Covers RC-002 FR-4 (add-row action), FR-5 (delete line), FR-6 (re-sequence), AC-1 (auto-assigned line number), FR-1 (column inventory).
