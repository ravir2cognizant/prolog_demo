---
id: TC-FE-018
rc-ref: RC-004
ci-ref: CI-004
type: a11y
priority: P1
automated: yes
---

# TC-FE-018 — Line Items Grid Keyboard Navigation and ARIA Grid Roles

## Scenario
The line items grid is keyboard-navigable; each cell is reachable via Tab/Arrow keys; column headers use `scope="col"`.

## Preconditions
- LineItemsGrid rendered with 3 rows of line item data

## Steps
1. Render `<LineItemsGrid lines={threeLines} />`
2. Assert grid element has `role="grid"` (or is a `<table>`)
3. Assert all `<th>` elements have `scope="col"` attribute
4. Assert each data cell input is focusable via Tab
5. Focus the AccountCodeInput of row 1; press Tab to reach DebitAmountInput
6. Run axe-core scan on the grid
7. Assert zero violations at WCAG AA

## Expected Result
- Grid has proper ARIA role
- Column headers have `scope="col"`
- All interactive cells reachable via keyboard
- Zero axe-core violations

## Test Data
```ts
const threeLines = [
  { lineId: 1, lineNumber: 1, accountCode: 'US-01-1000-100-01', accountDescription: 'Cash', debitAmount: 500, creditAmount: 0 },
  { lineId: 2, lineNumber: 2, accountCode: 'US-01-4000-100-01', accountDescription: 'Revenue', debitAmount: 0, creditAmount: 500 },
  { lineId: 3, lineNumber: 3, accountCode: '', accountDescription: '', debitAmount: 0, creditAmount: 0 },
]
```
