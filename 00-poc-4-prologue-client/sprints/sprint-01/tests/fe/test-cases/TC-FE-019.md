---
id: TC-FE-019
rc-ref: RC-005
ci-ref: CI-005
type: unit
priority: P1
automated: yes
---

# TC-FE-019 — Total Row Updates in Real Time When Lines Change

## Scenario
Adding a line item with a debit amount immediately updates the Total Debit in the footer; no page reload or save required.

## Preconditions
- LineItemsGrid with an initial set of lines and LineItemsGridFooter

## Steps
1. Render combined grid+footer with `lines = [{ lineId:1, debitAmount: 500, creditAmount: 0 }]`
2. Assert Total Debit shows `$500.00`
3. Add a second line with `debitAmount: 250`
4. Assert Total Debit immediately shows `$750.00` (500 + 250)
5. Assert Total Credit still shows `$0.00`
6. Delete line 1
7. Assert Total Debit immediately shows `$250.00`

## Expected Result
- Totals recalculate synchronously on every line add/change/delete
- No save or server round-trip required

## Test Data
- Controlled lines prop updated via state updates in test
