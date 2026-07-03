---
id: TC-BFF-024
ed-ref: ED-005
rc-ref: RC-005
type: integration
priority: P2
automated: yes
---

# TC-BFF-024 — DELETE /lines/{lineId} Causes Totals to Update

## Scenario
After deleting a line item, the JE totals (totalDebits, totalCredits, difference) reflect the removal of that line's amounts.

## Preconditions
- Seeded Unposted JE with journalId=1; 2 lines: lineId=1 (debitAmount=500), lineId=2 (creditAmount=500)

## Steps
1. `GET /journal-entries/1` → verify `totals.totalDebits=500, totals.totalCredits=500, difference=0, balanced=true`
2. `DELETE /journal-entries/1/lines/1`
3. `GET /journal-entries/1` → assert:
   - `totals.totalDebits` = 0.00
   - `totals.totalCredits` = 500.00
   - `totals.difference` = -500.00
   - `balanced` = false

## Expected Result
- Totals updated after deletion
- `balanced` recalculated correctly

## Test Data
- journalId: 1; two lines balancing each other; delete one
