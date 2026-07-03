---
id: TR-BFF-020
tc-ref: TC-BFF-020
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-020 -- POST /submit-for-approval Returns 200

## Verdict: PASS

## Evidence
```
✓ TC-BFF-020/021/022: Approval workflow > TC-BFF-020: submit-for-approval returns 200
```
Created JE with routing='rr-001', then POST /:id/submit-for-approval returned 200 with `status`="PendingApproval".

## Notes
Routing rule required for submission. rr-001 present in seed data.
