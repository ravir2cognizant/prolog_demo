---
id: TC-FE-001
rc-ref: RC-001
type: unit
priority: P1
automated: yes
---

# TC-FE-001 -- Journal Entry Header Form Renders All Required Fields

## Test Objective
Verify that the JournalEntryPage renders all header fields defined in RC-001 FR-1: Company ID dropdown, Journal Entry Type dropdown, Journal Entry ID (read-only), Status (read-only), Transaction Date, Auto Reversal Date, Description, Source Document, Allocation Method, Routing, and audit fields.

## Preconditions
- React 18 app mounted in jsdom via Vitest + @testing-library/react
- `apiClient.GET` mocked: `/companies` returns 1 company, all ref endpoints return empty lists
- Route: `/journal-entries/new` (create mode)

## Test Steps
1. Render `<JournalEntryPage />` with MemoryRouter at `/journal-entries/new`
2. Assert the Company ID select element is present (aria-label or label "Company")
3. Assert the Journal Entry Type select is present
4. Assert the Transaction Date input is present (type="date")
5. Assert the Description text input is present
6. Assert the Source Document select is present
7. Assert the Status read-only field shows "Unposted" for new entries
8. Assert the Posted field shows "No"

## Expected Results
- All 8 asserted elements are present in the rendered DOM
- Status = "Unposted", Posted = "No"
- No console errors during render

## Coverage Notes
Covers RC-001 FR-1 (field inventory), FR-6 (default status), AC-4 (new entry shows Unposted + No).
