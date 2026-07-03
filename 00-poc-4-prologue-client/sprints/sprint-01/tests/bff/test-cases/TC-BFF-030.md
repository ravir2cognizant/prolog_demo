---
id: TC-BFF-030
ed-ref: ED-007
rc-ref: RC-007
type: integration
priority: P1
automated: yes
---

# TC-BFF-030 — GET /navigation Returns isFirst=true + null IDs at First Record

## Scenario
When the current JE is the first in the navigation set, previousJournalId and firstJournalId are null and isFirst=true.

## Preconditions
- 3 seeded JEs; current = first (journalId=1)

## Steps
1. `GET /journal-entries/1/navigation`
2. Assert `isFirst` = true
3. Assert `previousJournalId` = null
4. Assert `firstJournalId` = null (already first; no entry "before" first)
5. Assert `nextJournalId` = 2
6. Assert `isLast` = false

### Last record boundary:
7. `GET /journal-entries/3/navigation`
8. Assert `isLast` = true
9. Assert `nextJournalId` = null
10. Assert `lastJournalId` = null

## Expected Result
- First record: isFirst=true; previous/first=null
- Last record: isLast=true; next/last=null

## Test Data
- journalId: 1 (first), journalId: 3 (last)
