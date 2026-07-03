---
id: TC-FE-023
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-FE-023 -- Post Action Calls Correct Endpoint and Updates Status Display

## Test Objective
Verify that clicking Post on a balanced Unposted entry calls `POST /journal-entries/{id}/post` and updates the displayed Status to "Posted".

## Preconditions
- JournalEntryPage loaded at `/journal-entries/je-unposted` with status = 'Unposted', balanced lines
- `apiClient.POST` mocked for `/journal-entries/je-unposted/post` returning `{ status: 'Posted', postedDateTime: '2026-05-21T20:00:00Z', postedUserId: 'user@fiserv.com' }`
- `apiClient.GET` also returns the updated entry on refresh

## Test Steps
1. Render JournalEntryPage with Unposted balanced entry
2. Click "Post" button
3. Await API mock to be called
4. Assert `apiClient.POST` called with path `/journal-entries/je-unposted/post`
5. Assert the Status field now displays "Posted"
6. Assert the Posted Date/Time field shows a value
7. Assert the Posted User ID field shows a value

## Expected Results
- POST endpoint called exactly once
- Status field updates to "Posted"
- Posted Date/Time and Posted User ID populated from response

## Coverage Notes
Covers RC-004 FR-2 (Post action), FR-3 (record posted datetime + userId), FR-4 (Posted flag = Yes), AC-1 (status changes to Posted).
