---
id: TR-BFF-012
tc-ref: TC-BFF-012
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-012 -- GET /currencies Returns isBase

## Verdict: PASS

## Evidence
```
✓ TC-BFF-012: GET /currencies > returns items with code, name, isBase; at least one isBase=true
```
GET /currencies returned 200 with `items` array. Each item has `code`, `name`, `isBase`. At least one item has `isBase=true` (USD).

## Notes
Seed: USD (isBase=true), EUR, GBP. Contract confirmed.
