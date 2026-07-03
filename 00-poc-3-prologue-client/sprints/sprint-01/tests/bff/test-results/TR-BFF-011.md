---
id: TR-BFF-011
tc-ref: TC-BFF-011
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-011 -- GET /accounts activeOnly Filter

## Verdict: PASS

## Evidence
```
✓ TC-BFF-011: GET /accounts activeOnly filter > activeOnly=true returns only active accounts
```
GET /accounts?companyId=comp-001&activeOnly=true returned only accounts with `active=true`. Length ≥ 1 confirmed.

## Notes
All seed accounts are active; filter correctly narrows results.
