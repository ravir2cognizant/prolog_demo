---
id: TC-FE-012
rc-ref: RC-003
ci-ref: CI-003
type: e2e
priority: P1
automated: yes
---

# TC-FE-012 — Full Create Journal Entry E2E Flow

## Scenario
A user creates a new journal entry from start to finish: fills the header form, saves, and verifies the journal is accessible.

## Preconditions
- Application running; user logged in
- GET /reference/companies returns at least 1 company
- GET /reference/journal-entry-types returns at least 1 type

## Steps
1. Navigate to the Journal Entry create page
2. Select first company from dropdown
3. Verify dropdown shows "code - name" format
4. Select first journal entry type
5. Set transaction date to today
6. Enter description "E2E Test Journal"
7. Click Save button
8. Assert form shows the newly assigned Journal Number
9. Assert Status field shows "Unposted"
10. Assert Edit Date/Time is populated
11. Assert the entry is accessible via record navigation

## Expected Result
- JE created with all header fields persisted
- Journal Number assigned automatically
- Status = "Unposted"
- Page transitions to view/edit mode for the new entry

## Test Data
- Live app with seeded reference data
