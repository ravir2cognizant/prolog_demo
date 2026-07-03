---
id: TC-FE-026
rc-ref: RC-006
ci-ref: CI-006
type: integration
priority: P1
automated: yes
---

# TC-FE-026 — Post Entry Action Triggers POST /journal-entries/{id}/post; Updates Status

## Scenario
Clicking the PostEntryButton triggers POST /journal-entries/{journalId}/post; on success the status updates to "Posted" and PostEntryButton disappears.

## Preconditions
- MSW handler: `POST /journal-entries/1/post → 200 { status: 'Posted', postedDateTime: '2026-05-23T12:00:00Z', posterUserId: 'Supervisor1' }`
- JE rendered with status="Unposted", isBalanced=true

## Steps
1. Render JE form with MSW active; status="Unposted"; isBalanced=true
2. Assert PostEntryButton is visible and enabled
3. Click PostEntryButton
4. Assert POST /journal-entries/1/post was called
5. After response: assert StatusBadge text changes to "Posted"
6. Assert StatusBadge class changes to `.badge-posted`
7. Assert PostEntryButton is no longer in the DOM
8. Assert Posted Date/Time shows "2026-05-23T12:00:00Z"
9. Assert Poster User ID shows "Supervisor1"

## Expected Result
- POST triggered on button click
- Status badge updates to Posted (green)
- PostEntryButton removed
- Audit fields populate with post response data

## Test Data
- MSW mock as above
