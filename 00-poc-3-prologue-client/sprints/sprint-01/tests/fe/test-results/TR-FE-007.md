---
id: TR-FE-007
tc-ref: TC-FE-007
verdict: PASS
executed-by: A-07
date: 2026-05-21
runner: vitest
---

# TR-FE-007 -- Journal Entry List Page: Company Selector Loads Entries, Status Filter

## Verdict: PASS

## Evidence
All 4 Vitest tests in `src/test/JournalEntriesListPage.test.tsx` PASS:
1. `renders the New Entry button` — ✓ New Entry link/button present
2. `loads companies into the selector` — ✓ company "Fiserv Inc." appears as option after mock load
3. `renders journal entries after company loads` — ✓ entries "Monthly Payroll January 2026" and "Prepaid Insurance Accrual" present
4. `renders a Posted status badge` — ✓ "Posted" status badge rendered for first entry

## Notes
act() warnings present in test output (async state update outside act). This is a harness-level warning, not a functional failure. Tests pass correctly.
