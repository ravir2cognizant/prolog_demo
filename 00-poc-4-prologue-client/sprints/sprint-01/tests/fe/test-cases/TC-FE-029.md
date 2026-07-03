---
id: TC-FE-029
rc-ref: RC-007
ci-ref: CI-007
type: integration
priority: P1
automated: yes
---

# TC-FE-029 — Clicking Next Fetches Next JE and Updates Form

## Scenario
Clicking the "Next" navigation button fetches the next journal entry via the navigation endpoint and loads it into the form, without a full page reload.

## Preconditions
- MSW handler: `GET /journal-entries/1/navigation → 200 { currentJournalId:1, nextJournalId:2, previousJournalId:null, isFirst:true, isLast:false, ... }`
- MSW handler: `GET /journal-entries/2 → 200 { journalId:2, journalNumber:1002, ... }`

## Steps
1. Render JE form for journalId=1 with MSW active
2. Assert navigation toolbar shows; "First" and "Previous" disabled (`isFirst=true`)
3. Click "Next" button
4. Assert GET /journal-entries/2 was called
5. Assert form now shows journalNumber 1002
6. Assert navigation toolbar refreshes (no disabled state if not at boundary)

## Expected Result
- Click "Next" → load journalId=2 into form
- Navigation completes without full page reload (SPA behaviour)
- Navigation within 1 second (RC-007 NFR)

## Test Data
- MSW mocks as above
