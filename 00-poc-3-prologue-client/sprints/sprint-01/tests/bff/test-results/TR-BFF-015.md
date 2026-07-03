---
id: TR-BFF-015
tc-ref: TC-BFF-015
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-015 -- POST /post Already Posted Returns 409

## Verdict: PASS

## Evidence
```
✓ TC-BFF-015: POST /post already posted → 409 > returns 409 on double-post
```
Created balanced JE, posted it, then attempted to POST /:id/post again. Second post returned 409.

## Notes
Idempotency guard confirmed. ENTRY_ALREADY_POSTED or equivalent code returned.
