---
id: TC-FE-005
rc-ref: RC-004
type: unit
priority: P1
automated: yes
---

# TC-FE-005 -- Post Button Visible for Unposted Entry; Entry Goes Read-Only on Posted Load

## Test Objective
Verify that (a) the Post action button is rendered for an Unposted entry, and (b) when a Posted entry is loaded, all line fields and the Transaction Date become read-only, and the Post button is replaced by the Unpost button.

## Preconditions
- `apiClient.GET` mocked: returns a journal entry with `status: 'Posted'` for edit scenario
- `apiClient.POST` mocked for `/journal-entries/{id}/post` and `/unpost`

## Test Steps
**Scenario A -- Unposted entry (create mode):**
1. Render JournalEntryPage in create mode (status = 'Unposted')
2. Assert "Post" button is present in the action bar
3. Assert "Unpost" button is NOT present

**Scenario B -- Posted entry (edit mode, id = 'je-posted'):**
1. Render JournalEntryPage with route `/journal-entries/je-posted`
2. Mock GET `/journal-entries/je-posted` to return status = 'Posted'
3. Assert "Unpost" button is present
4. Assert "Post" button is NOT present
5. Assert the Transaction Date input is `disabled` or `readOnly`
6. Assert line Debit/Credit inputs are all disabled

## Expected Results
- Unposted: Post button visible, Unpost hidden, fields editable
- Posted: Unpost button visible, Post hidden, header + line fields read-only

## Coverage Notes
Covers RC-004 FR-2 (Post action), FR-6 (no editing when posted), FR-8 (Unpost action), AC-3 (posted entry is read-only), AC-4 (Unpost reverts status).
