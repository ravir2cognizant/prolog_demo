---
id: TC-FE-004
rc-ref: RC-003
type: unit
priority: P1
automated: yes
---

# TC-FE-004 -- Live Balance Totals: Balanced Entry Shows $0.00 Difference

## Test Objective
Verify that the totals row updates in real time as line values change, that a balanced entry shows Difference = $0.00 with no warning, and that an unbalanced entry shows a non-zero difference with a visual warning indicator.

## Preconditions
- JournalEntryPage rendered in create mode
- 2 default lines present

## Test Steps
1. Enter Debit "1825.00" in line 1 (credit = "0.00")
2. Enter Credit "1825.00" in line 2 (debit = "0.00")
3. Assert the "Total Debit" display shows 1825.00
4. Assert the "Total Credit" display shows 1825.00
5. Assert the "Difference" display shows 0.00
6. Assert the Difference cell does NOT have the error/red class
7. Change line 2 Credit to "900.00"
8. Assert Difference shows 925.00 (non-zero)
9. Assert the Difference cell DOES have the error/warning styling (e.g. text-error class or role="alert")

## Expected Results
- Totals row updates reactively without a save
- Balanced state: difference = 0.00, no warning indicator
- Unbalanced state: difference ≠ 0.00, warning indicator present

## Coverage Notes
Covers RC-003 FR-1 (totals row), FR-2 (real-time update), FR-3 (warning colour when non-zero), AC-1 (balanced totals), AC-2 (real-time), AC-4 (no warning when balanced), AC-5 (warning when unbalanced).
