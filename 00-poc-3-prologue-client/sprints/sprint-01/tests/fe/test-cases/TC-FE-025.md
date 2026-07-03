---
id: TC-FE-025
rc-ref: RC-001
type: e2e
priority: P1
automated: yes
---

# TC-FE-025 -- E2E: Create New Journal Entry End-to-End (Happy Path)

## Test Objective
Full end-to-end Playwright test: user navigates to Journal Entries, clicks New Entry, fills in header + lines, saves, and the new entry appears in the list.

## Preconditions
- App running at http://localhost:5173 (dev mode with MSW worker)
- MSW browser worker intercepts all API calls with fixture data

## Test Steps
1. Navigate to http://localhost:5173/journal-entries
2. Select company from dropdown (first option)
3. Assert the list table is visible
4. Click "New Entry" button
5. Assert navigation to /journal-entries/new
6. Fill in: Company (select first), Type (select first), Date (2026-05-21), Description ("E2E Test Entry")
7. In line 1: set Account, Debit = 1000
8. In line 2: set Account, Credit = 1000
9. Assert Difference shows 0.00
10. Click Save
11. Assert no error toast appears
12. Assert navigation redirects to the edit page (URL contains /journal-entries/)

## Expected Results
- Full create flow completes without errors
- Entry saved and page transitions to edit mode with the new JE ID

## Coverage Notes
Covers RC-001 AC-1, AC-2 end-to-end. RC-002 AC-1 (add lines), RC-003 AC-1 (balanced totals). E2E happy path.
