---
id: TC-BFF-023
ed-ref: ED-005
rc-ref: RC-005
type: integration
priority: P1
automated: yes
---

# TC-BFF-023 — POST /lines Response Includes Updated Totals

## Scenario
After adding a line item, the POST /lines response (or subsequent GET /journal-entries/{id}) includes updated `totals.totalDebits`, `totals.totalCredits`, and `totals.difference` (ED-005 contract).

## Preconditions
- Seeded Unposted JE with journalId=1; 1 existing line with debitAmount=500.00

## Steps
1. `POST /journal-entries/1/lines` with `debitAmount: 250.00`
2. Check updated totals (either in POST response or via GET /journal-entries/1):
   - `totals.totalDebits` = 750.00 (500 + 250)
   - `totals.totalCredits` = 0.00
   - `totals.difference` = 750.00

## Expected Result
- Totals correctly updated after line addition
- Server totals agree with client-side calculation

## Test Data
- Initial: totalDebits=500; add debitAmount=250; expected totalDebits=750
