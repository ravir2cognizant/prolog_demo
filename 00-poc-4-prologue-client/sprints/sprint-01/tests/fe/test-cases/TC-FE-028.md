---
id: TC-FE-028
rc-ref: RC-007
ci-ref: CI-007
type: unit
priority: P1
automated: yes
---

# TC-FE-028 — First+Previous Disabled When isFirst; Next+Last Disabled When isLast

## Scenario
RecordNavigationToolbar disables First and Previous buttons when `isFirst=true`; disables Next and Last buttons when `isLast=true`.

## Preconditions
- RecordNavigationToolbar component

## Steps
### At first record:
1. Render `<RecordNavigationToolbar isFirst={true} isLast={false} firstJournalId={1} previousJournalId={null} nextJournalId={2} lastJournalId={10} />`
2. Assert "First" button is disabled
3. Assert "Previous" button is disabled
4. Assert "Next" button is NOT disabled
5. Assert "Last" button is NOT disabled

### At last record:
6. Render with `isFirst={false} isLast={true}`
7. Assert "Next" button is disabled
8. Assert "Last" button is disabled
9. Assert "First" button is NOT disabled
10. Assert "Previous" button is NOT disabled

### Middle record:
11. Render with `isFirst={false} isLast={false}`
12. Assert all 4 buttons are NOT disabled

## Expected Result
- Boundary disabling applied correctly per `isFirst`/`isLast` props

## Test Data
- Various isFirst/isLast combinations
