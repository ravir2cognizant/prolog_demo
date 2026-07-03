---
id: TR-BFF-024
tc-ref: TC-BFF-024
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
defect-ref: DEF-BFF-002
---

# TR-BFF-024 -- GET /fiscal-years Stub (Not 500)

## Verdict: PASS (after test correction)

## Evidence
```
✓ TC-BFF-024: GET /fiscal-years stub > returns 200 or 404 (not 500)
```
GET /fiscal-years?companyId=comp-001 returned 200 with `items` array containing fy-2026.

## Notes
**Test correction applied:** Original test did not include required `companyId` query param, causing Zod validation error (400). Test updated to include `?companyId=comp-001`. The fiscal-years route requires `companyId` as a mandatory parameter per `ListFiscalYearsQuerySchema`. Fiscal year fy-2026 is present in seed data.
