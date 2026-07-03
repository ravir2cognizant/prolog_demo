---
id: TC-BFF-022
ed-ref: ED-004
rc-ref: RC-004
type: unit
priority: P2
automated: yes
---

# TC-BFF-022 — POST /lines Auto-Assigns Sequential lineNumber

## Scenario
When multiple lines are added to a JE, each gets the next sequential lineNumber (1, 2, 3...).

## Preconditions
- Seeded Unposted JE with journalId=1 and 0 existing lines (or known count)

## Steps
1. `POST /journal-entries/1/lines` (first line) → assert `lineNumber` = 1
2. `POST /journal-entries/1/lines` (second line) → assert `lineNumber` = 2
3. `POST /journal-entries/1/lines` (third line) → assert `lineNumber` = 3

## Expected Result
- lineNumbers assigned sequentially: 1, 2, 3

## Test Data
- journalId: 1; minimal line payloads with valid accountCode and debitAmount
