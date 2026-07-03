---
id: TC-FE-021
rc-ref: RC-005
ci-ref: CI-005
type: unit
priority: P2
automated: yes
---

# TC-FE-021 — Balance Recalculation Completes Within 100ms

## Scenario
The client-side balance recalculation (total debit sum, total credit sum, difference) completes within 100ms of any line item change (RC-005 NFR).

## Preconditions
- Grid with 50 existing lines (stress test for recalculation performance)

## Steps
1. Render grid with 50 lines pre-populated
2. Record `t0 = performance.now()`
3. Update debitAmount on one line
4. Wait for DifferenceRow to reflect updated total
5. Record `t1 = performance.now()`
6. Assert `(t1 - t0) < 100`

## Expected Result
- Recalculation completes in < 100ms even with 50 lines

## Test Data
- 50 generated lines with alternating debit/credit amounts
