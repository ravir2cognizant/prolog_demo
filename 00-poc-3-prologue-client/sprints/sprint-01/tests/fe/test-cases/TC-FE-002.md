---
id: TC-FE-002
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-FE-002 -- Journal Entry Header Save (Create Mode) Calls POST and Resets to Edit Mode

## Test Objective
Verify that saving a new journal entry header via the form calls `POST /journal-entries` with the correct payload and that the page transitions to edit mode displaying the returned Journal Entry ID.

## Preconditions
- `apiClient.GET` mocked for all ref endpoints
- `apiClient.POST` mocked: `POST /journal-entries` returns `{ id: 'je-test-01', status: 'Unposted', ... }`
- `apiClient.PUT` mocked
- Route: `/journal-entries/new`

## Test Steps
1. Render `<JournalEntryPage />` in create mode
2. Select a Company ID from the dropdown
3. Select a Journal Entry Type
4. Enter a Transaction Date
5. Enter a Description "Test journal entry"
6. Add two lines (one debit $100, one credit $100)
7. Click the Save button
8. Await API mock to be called
9. Assert `apiClient.POST` was called with path `/journal-entries`
10. Assert the returned Journal Entry ID `je-test-01` is now displayed in the header

## Expected Results
- `POST /journal-entries` called exactly once with non-empty body
- After successful save, the JE ID field shows the returned ID
- Status remains "Unposted" after save

## Coverage Notes
Covers RC-001 AC-2 (unique JE ID assigned on save), FR-2 (auto-assign sequential ID). Integration test: form submit → API call → UI update.
