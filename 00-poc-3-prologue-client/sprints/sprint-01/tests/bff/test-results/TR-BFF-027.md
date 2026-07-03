---
id: TR-BFF-027
tc-ref: TC-BFF-027
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
defect-ref: DEF-BFF-002
---

# TR-BFF-027 -- PUT /accounts/{id} Update Returns 200

## Verdict: PASS (after test correction)

## Evidence
```
✓ TC-BFF-027: PUT /accounts/{id} update > returns 200 with id, updatedAt, updatedByUserId
```
Created account with code='1-100-0002-001-01', then PUT /:id with `{ description: "updated" }` returned 200 with `id`, `updatedAt` (ISO string), `updatedByUserId` = "dev-user-001".

## Notes
**Test correction applied:** Same root cause as TC-BFF-026 — invalid code format in original test. Updated to all-digit code. Update audit fields confirmed.
