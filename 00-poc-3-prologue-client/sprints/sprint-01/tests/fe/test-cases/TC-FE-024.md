---
id: TC-FE-024
rc-ref: RC-006
type: unit
priority: P2
automated: yes
---

# TC-FE-024 -- Journal Entry List: isFirst/isLast Flags Reflected in Navigation State

## Test Objective
Verify that when the JournalEntriesListPage receives `isFirst: true` from the API, the Previous navigation is visually disabled, and when `isLast: true`, the Next navigation is disabled.

## Preconditions
- `apiClient.GET` for `/journal-entries` returns `{ ..., isFirst: true, isLast: false }`

## Test Steps
1. Render JournalEntriesListPage, select company
2. Await list load where isFirst = true
3. Assert First and Previous navigation indicators/buttons are disabled
4. Change mock to return `isLast: true`
5. Reload/re-trigger
6. Assert Next and Last navigation indicators/buttons are disabled

## Expected Results
- isFirst = true → First + Previous disabled
- isLast = true → Next + Last disabled

## Coverage Notes
Covers RC-006 FR-3 (Previous disabled at first), FR-4 (Next disabled at last), AC-2 (First + Previous disabled), AC-3 (Next + Last disabled).
