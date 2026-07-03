---
id: TC-FE-008
rc-ref: RC-007
type: unit
priority: P2
automated: yes
---

# TC-FE-008 -- Audit Trail Fields Are Read-Only and Populated from API Response

## Test Objective
Verify that Edit Date/Time and Edit User ID fields are visible in the journal entry header and are read-only (non-editable), populated from the GET response, and never show a blank/missing state when the API response includes them.

## Preconditions
- `apiClient.GET` mocked for `/journal-entries/je-001` returning:
  `{ ..., editDateTime: '2026-05-21T19:13:00Z', editUserId: 'jsmith@fiserv.com' }`

## Test Steps
1. Render JournalEntryPage with route `/journal-entries/je-001`
2. Await the entry to load
3. Locate the "Edit Date/Time" display element
4. Assert it shows a formatted date/time containing "2026-05-21"
5. Locate the "Edit User ID" display element
6. Assert it shows "jsmith@fiserv.com"
7. Attempt to find an editable input for either field
8. Assert no `<input>` with those values is editable (they are rendered as read-only text)

## Expected Results
- Both audit fields present and visible in the header
- Values match the API response
- Fields are rendered as read-only (not standard form inputs)

## Coverage Notes
Covers RC-007 FR-1 (two read-only audit fields), FR-2 (auto-updated, not user-settable), FR-3 (timestamp precision), FR-4 (always visible), AC-3 (non-editable), AC-4 (visible without extra action).
