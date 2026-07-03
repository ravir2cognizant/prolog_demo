---
id: TR-BFF-014
tc-ref: TC-BFF-014
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-014 -- POST /post Happy Path

## Verdict: PASS

## Evidence
```
✓ TC-BFF-014: POST /post happy path > returns 200 with status=Posted, posted=true, postedAt, postedByUserId
```
Created balanced JE (debit 1000 / credit 1000 across two lines), then POST /:id/post returned 200 with `status`="Posted", `posted`=true, `postedAt` (ISO string), `postedByUserId`="dev-user-001".

## Notes
Lines: acct-001 debit 1000, acct-003 credit 1000 (USD). Balanced. Post succeeded.
