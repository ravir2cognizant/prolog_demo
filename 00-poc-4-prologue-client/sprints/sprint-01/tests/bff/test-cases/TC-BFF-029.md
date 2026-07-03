---
id: TC-BFF-029
ed-ref: ED-007
rc-ref: RC-007
type: integration
priority: P1
automated: yes
---

# TC-BFF-029 — GET /journal-entries/{journalId}/navigation Returns Navigation Context

## Scenario
GET /journal-entries/{journalId}/navigation returns correct navigation IDs and boundary flags for a middle record.

## Preconditions
- Seeded: 3 JEs with journalIds 1, 2, 3 sorted by journalNumber asc
- Current: journalId=2

## Steps
1. `GET /journal-entries/2/navigation`
2. Assert status 200
3. Assert `currentJournalId` = 2
4. Assert `firstJournalId` = 1
5. Assert `previousJournalId` = 1
6. Assert `nextJournalId` = 3
7. Assert `lastJournalId` = 3
8. Assert `isFirst` = false
9. Assert `isLast` = false
10. Assert `totalCount` = 3

## Expected Result
- `200 OK`
- All 8 response fields correctly populated for middle record

## Test Data
- 3 seeded JEs; current = middle one
