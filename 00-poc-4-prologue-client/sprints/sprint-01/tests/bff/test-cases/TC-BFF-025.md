---
id: TC-BFF-025
ed-ref: ED-006
rc-ref: RC-006
type: integration
priority: P1
automated: yes
---

# TC-BFF-025 — POST /journal-entries/{journalId}/post Returns 200 on Balanced JE

## Scenario
POST /journal-entries/{journalId}/post on a balanced, Unposted JE returns 200 with status="Posted", postedDateTime, and posterUserId.

## Preconditions
- Seeded Unposted balanced JE with journalId=1 (totalDebits=500, totalCredits=500)

## Steps
1. `POST /journal-entries/1/post`
2. Assert status 200
3. Assert `status` = "Posted"
4. Assert `postedDateTime` is a valid ISO 8601 datetime
5. Assert `posterUserId` matches authenticated user
6. `GET /journal-entries/1` → assert `status` = "Posted"; `postedDateTime` and `posterUserId` populated

## Expected Result
- `200 OK`
- JE status transitions from "Unposted" to "Posted"
- Audit fields populated

## Test Data
- journalId: 1 (balanced: totalDebits=500, totalCredits=500)
