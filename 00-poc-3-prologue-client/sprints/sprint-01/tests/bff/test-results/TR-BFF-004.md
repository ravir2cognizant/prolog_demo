---
id: TR-BFF-004
tc-ref: TC-BFF-004
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-004 -- POST /journal-entries Validation Failure

## Verdict: PASS

## Evidence
```
✓ TC-BFF-004: POST /journal-entries validation failure > returns 400 problem+json with status and code
```
POST /journal-entries with empty body returned 400, Content-Type: application/problem+json, body has `status` and `code` fields.

## Notes
Zod validation error surface as problem+json confirmed.
