---
id: TC-BFF-016
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-016 -- POST /journal-entries/{id}/unpost Reverts Posted Entry to Unposted

## Test Objective
Verify that unposting a Posted entry returns 200 with `status: "Unposted"`, `posted: false`, `postedAt: null`, and `postedByUserId: null`.

## Preconditions
- AUTH_DEV_BYPASS=1
- A Posted JE exists (post one using TC-BFF-014 flow)

## Test Steps
1. Create and post a balanced JE
2. `POST /journal-entries/{id}/unpost`
3. Assert `res.status === 200`
4. Assert `res.body.status === "Unposted"`
5. Assert `res.body.posted === false`
6. Assert `res.body.postedAt === null`
7. Assert `res.body.postedByUserId === null`

## Expected Results
- 200 OK
- Status reverts to Unposted
- Posted audit fields cleared

## Coverage Notes
Covers ED-004 Unpost response model, RC-004 FR-8, AC-4 (unpost reverts status + clears posted fields).
