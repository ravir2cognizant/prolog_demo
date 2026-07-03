---
id: TC-BFF-011
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-011 — PUT /journal-entries/{journalId} Updates Header; Returns 200

## Scenario
PUT /journal-entries/{journalId} on an Unposted JE updates mutable fields and returns 200 with updated editDateTime and editUserId.

## Preconditions
- Seeded Unposted JE with journalId=1

## Steps
1. `PUT /journal-entries/1` with body: `{ "description": "Updated description", "transactionDate": "2026-05-24" }`
2. Assert status 200
3. Assert response has `journalId: 1`
4. Assert `editDateTime` is a valid ISO 8601 datetime (updated by server)
5. Assert `editUserId` matches authenticated user
6. GET /journal-entries/1 → assert `description` = "Updated description"

## Expected Result
- `200 OK`
- editDateTime and editUserId refreshed
- Updated fields persisted

## Test Data
- journalId: 1 (seeded Unposted JE)
