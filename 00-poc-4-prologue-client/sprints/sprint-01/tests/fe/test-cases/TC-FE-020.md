---
id: TC-FE-020
rc-ref: RC-005
ci-ref: CI-005
type: unit
priority: P1
automated: yes
---

# TC-FE-020 — Difference Row Shows $0.00 When Balanced; Shows Non-Zero When Unbalanced

## Scenario
DifferenceRow shows $0.00 when total debits equal total credits; shows the non-zero difference and applies the unbalanced class when they differ.

## Preconditions
- LineItemsGridFooter component

## Steps
### Balanced:
1. Render `<LineItemsGridFooter totalDebits={1435} totalCredits={1435} />`
2. Assert DifferenceRow shows `$0.00`
3. Assert DifferenceRow does NOT have class `.data-grid-difference-row--unbalanced`

### Unbalanced:
4. Render `<LineItemsGridFooter totalDebits={1500} totalCredits={1435} />`
5. Assert DifferenceRow shows `$65.00`
6. Assert DifferenceRow HAS class `.data-grid-difference-row--unbalanced`

## Expected Result
- Balanced: $0.00; no red class
- Unbalanced: correct difference amount; `.data-grid-difference-row--unbalanced` applied

## Test Data
- totalDebits: 1435, totalCredits: 1435 (balanced)
- totalDebits: 1500, totalCredits: 1435 (unbalanced; difference = 65)
