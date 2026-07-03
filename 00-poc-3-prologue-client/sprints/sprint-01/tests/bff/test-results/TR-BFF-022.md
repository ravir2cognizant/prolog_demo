---
id: TR-BFF-022
tc-ref: TC-BFF-022
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-022 -- POST /reject With/Without Reason

## Verdict: PASS

## Evidence
```
✓ TC-BFF-020/021/022: Approval workflow > TC-BFF-022: reject with reason returns 200; reject without reason returns 400
```
POST /:id/reject with `{ reason: "..." }` returned 200. POST /:id/reject with empty body returned 400.

## Notes
Reject requires reason field. Validation enforced. Both happy-path and error-path confirmed.
