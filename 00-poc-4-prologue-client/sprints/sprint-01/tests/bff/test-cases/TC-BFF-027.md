---
id: TC-BFF-027
ed-ref: ED-006
rc-ref: RC-006
type: integration
priority: P1
automated: yes
---

# TC-BFF-027 — POST /journal-entries/{journalId}/post Returns 400 on Already-Posted JE

## Scenario
POST /journal-entries/{journalId}/post on a JE that is already Posted returns 400.

## Preconditions
- Seeded Posted JE with journalId=2

## Steps
1. `POST /journal-entries/2/post` (already Posted)
2. Assert status 400
3. Assert error body references already-posted state

## Expected Result
- `400 Bad Request`
- Cannot re-post a Posted entry

## Test Data
- journalId: 2 (already Posted)
