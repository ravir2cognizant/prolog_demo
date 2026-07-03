---
id: TR-BFF-016
tc-ref: TC-BFF-016
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-016 -- POST /unpost Happy Path

## Verdict: PASS

## Evidence
```
✓ TC-BFF-016: POST /unpost > returns 200 with status=Unposted, posted=false, nulled audit fields
```
Created balanced JE, posted, then POST /:id/unpost returned 200 with `status`="Unposted", `posted`=false, `postedAt`=null, `postedByUserId`=null.

## Notes
Unpost correctly reverses post audit fields to null.
