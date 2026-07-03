---
id: TC-BFF-026
ed-ref: ED-006
rc-ref: RC-006
type: integration
priority: P1
automated: yes
---

# TC-BFF-026 — POST /journal-entries/{journalId}/post Returns 400 When Unbalanced

## Scenario
POST /journal-entries/{journalId}/post on an unbalanced JE (totalDebits ≠ totalCredits) returns 400.

## Preconditions
- Seeded Unposted JE with journalId=3 (unbalanced: totalDebits=500, totalCredits=0)

## Steps
1. `POST /journal-entries/3/post`
2. Assert status 400
3. Assert response body contains error message about balance requirement

## Expected Result
- `400 Bad Request`
- JE status remains "Unposted"

## Test Data
- journalId: 3 (totalDebits=500, totalCredits=0)
