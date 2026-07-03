---
id: TC-FE-007
rc-ref: RC-006
type: unit
priority: P2
automated: yes
---

# TC-FE-007 -- Journal Entry List Page: Company Selector Loads Entries, Status Filter Applied

## Test Objective
Verify that JournalEntriesListPage loads the company list on mount, fetches journal entries when a company is selected, and displays them in the DataTable with correct status badges. Covers the list/browse navigation (RC-006) and the list view as the entry point for record navigation.

## Preconditions
- `apiClient.GET` mocked:
  - `/companies` → `{ items: [{ id: 'c1', name: 'Fiserv Inc.', active: true }] }`
  - `/journal-entries` → `{ items: [{ id: 'je-001', description: 'Monthly Payroll', status: 'Posted', transactionDate: '2026-01-31', totalDebit: 1825.00 }], totalCount: 1, isFirst: true, isLast: true }`

## Test Steps
1. Render `<JournalEntriesListPage />`
2. Assert the Companies select is rendered
3. Assert company "Fiserv Inc." appears as an option
4. Select company "c1"
5. Await `apiClient.GET` called with `/journal-entries`
6. Assert the data table shows 1 row with description "Monthly Payroll"
7. Assert a "Posted" status badge is rendered in the row
8. Assert a "New Entry" button/link is present

## Expected Results
- Company list populated from `/companies`
- Journal entry list populated after company select
- Correct status badge rendered (Posted = green/success)
- New Entry navigation link present

## Coverage Notes
Covers RC-006 FR-2 (load and display entry), navigation entry point. Also covers CI-001 (JournalEntriesListPage component inventory — company select, status badge, table).
