---
id: TC-FE-006
rc-ref: RC-002
ci-ref: CI-002
type: unit
priority: P1
automated: yes
---

# TC-FE-006 — JE Header Unposted vs Posted State

## Scenario
When status is "Unposted", Posted Date/Time and Poster User ID display as empty. When status is "Posted", all post-audit fields are populated.

## Preconditions
- Two JE data objects: one unposted, one posted

## Steps
### Unposted:
1. Render `<JournalEntryHeader journalEntry={unpostedJE} />`
2. Assert StatusBadge has class `.badge-unposted` and text "Unposted"
3. Assert "Posted Date/Time" field value is empty/null
4. Assert "Poster User ID" field value is empty/null

### Posted:
5. Render `<JournalEntryHeader journalEntry={postedJE} />`
6. Assert StatusBadge has class `.badge-posted` and text "Posted"
7. Assert "Posted Date/Time" shows "2026-05-23T12:00:00Z"
8. Assert "Poster User ID" shows "Supervisor1"

## Expected Result
- Unposted: amber badge; post fields empty
- Posted: green badge; post fields populated with actual timestamps/user

## Test Data
```ts
const unpostedJE = { ...baseJE, status: 'Unposted', postedDateTime: null, posterUserId: null }
const postedJE = { ...baseJE, status: 'Posted', postedDateTime: '2026-05-23T12:00:00Z', posterUserId: 'Supervisor1' }
```
