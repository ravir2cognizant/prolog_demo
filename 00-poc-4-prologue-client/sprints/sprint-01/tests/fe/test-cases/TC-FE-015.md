---
id: TC-FE-015
rc-ref: RC-004
ci-ref: CI-004
type: unit
priority: P1
automated: yes
---

# TC-FE-015 — Debit/Credit Mutual Exclusion (Dimming Behaviour)

## Scenario
When a debit amount > 0 is entered on a line, the credit field dims (50% opacity, pointer-events: none). When a credit amount > 0 is entered, the debit field dims.

## Preconditions
- LineItemRow rendered with both debitAmount and creditAmount initially 0

## Steps
### Debit entered:
1. Render `<LineItemRow debitAmount={0} creditAmount={0} siblingHasValue={false} />`
2. Set debitAmount to 100
3. Assert creditAmount input has `siblingHasValue={true}` prop or equivalent dimmed state
4. Assert credit input has `opacity: 0.5` style and `pointer-events: none`

### Credit entered:
5. Render with creditAmount=500, debitAmount=0
6. Assert debit input is dimmed (opacity 0.5, pointer-events: none)

### Both empty:
7. Render with debitAmount=0, creditAmount=0
8. Assert neither input is dimmed

## Expected Result
- Debit > 0 → credit dims; Credit > 0 → debit dims; Both 0 → neither dims

## Test Data
- LineItemRow with controlled debitAmount/creditAmount props
