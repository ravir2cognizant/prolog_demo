---
id: TC-BFF-014
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-014 -- POST /journal-entries/{id}/post Happy Path Returns status=Posted

## Test Objective
Verify that posting a balanced Unposted journal entry returns 200 with `status: "Posted"`, `posted: true`, `postedAt`, and `postedByUserId`.

## Preconditions
- AUTH_DEV_BYPASS=1
- Create a balanced JE (debit=1000, credit=1000 on two lines) and capture the id

## Test Steps
1. Create balanced JE: POST /journal-entries with two lines (debit 1000 + credit 1000)
2. `POST /journal-entries/{id}/post`
3. Assert `res.status === 200`
4. Assert `res.body.status === "Posted"`
5. Assert `res.body.posted === true`
6. Assert `res.body.postedAt` is a non-empty ISO string
7. Assert `res.body.postedByUserId` is a non-empty string

## Expected Results
- 200 OK
- Status = "Posted", posted = true
- postedAt and postedByUserId set server-side

## Coverage Notes
Covers ED-004 Post Journal Entry happy path, RC-004 FR-2/FR-3/FR-4, AC-1.
