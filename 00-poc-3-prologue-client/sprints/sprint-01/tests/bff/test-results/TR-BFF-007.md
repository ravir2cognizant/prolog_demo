---
id: TR-BFF-007
tc-ref: TC-BFF-007
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-007 -- GET /companies Items Shape

## Verdict: PASS

## Evidence
```
✓ TC-BFF-007: GET /companies > returns 200 with items having id, name, active
```
GET /companies returned 200 with `items` array. First item has `id` (string), `name` (string), `active` (boolean).

## Notes
Public endpoint (no auth). Seed: comp-001 "Acme Corp", active=true.
