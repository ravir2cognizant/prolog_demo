---
id: TR-BFF-029
tc-ref: TC-BFF-029
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-029 -- POST /accounts Validation Failure Returns 400

## Verdict: PASS

## Evidence
```
✓ TC-BFF-029: POST /accounts validation failure > returns 400 problem+json when required fields missing
```
POST /accounts with `{ companyId: 'comp-001' }` (missing code, description, type) returned 400 with Content-Type: application/problem+json.

## Notes
Zod schema validation error surfaced as problem+json confirmed for accounts endpoint.
