---
id: TC-FE-016
rc-ref: RC-004
ci-ref: CI-004
type: unit
priority: P1
automated: yes
---

# TC-FE-016 — Add Row and Delete Row in Line Items Grid

## Scenario
Clicking "Add Line" appends a new empty row with the next sequential line number. Clicking delete on a row removes it from the grid.

## Preconditions
- LineItemsGrid with 2 existing lines (lineNumber 1 and 2)

## Steps
### Add row:
1. Render `<LineItemsGrid lines={[line1, line2]} onLinesChange={mockFn} />`
2. Click "Add Line" button
3. Assert `onLinesChange` called with 3 lines
4. Assert new row has `lineNumber = 3` and all data fields empty
5. Assert grid shows 3 rows

### Delete row:
6. Click delete button on row with lineNumber 2
7. Assert `onLinesChange` called with 2 lines
8. Assert row with lineNumber 2 is removed from the DOM

## Expected Result
- Add: new row appears at bottom with next lineNumber; all fields empty
- Delete: row removed from grid immediately

## Test Data
```ts
const line1 = { lineId: 1, lineNumber: 1, accountCode: '', accountDescription: '', debitAmount: 0, creditAmount: 0 }
const line2 = { lineId: 2, lineNumber: 2, accountCode: '', accountDescription: '', debitAmount: 100, creditAmount: 0 }
```
