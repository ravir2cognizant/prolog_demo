---
id: TR-BFF-025
tc-ref: TC-BFF-025
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-025 -- GET /routing-rules Returns Items

## Verdict: PASS

## Evidence
```
✓ TC-BFF-025: GET /routing-rules > returns items with id, name, description
```
GET /routing-rules returned 200 with `items` array. Each item has `id`, `name`, `description`.

## Notes
Public endpoint. Seed: rr-001 "GL Supervisor Approval" present.
