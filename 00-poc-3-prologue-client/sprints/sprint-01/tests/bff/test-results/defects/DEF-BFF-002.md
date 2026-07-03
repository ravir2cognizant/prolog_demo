---
id: DEF-BFF-002
test-case: TC-BFF-024, TC-BFF-026, TC-BFF-027
owner: test-case-bug
severity: info
location: sprints/sprint-01/tests/bff/test-cases/TC-BFF-024.md, TC-BFF-026.md, TC-BFF-027.md
reporter: A-08
date: 2026-05-21
status: open
---

# DEF-BFF-002 -- Test Case Spec Errors in TC-BFF-024, TC-BFF-026, TC-BFF-027

## Summary
Three test cases contained incorrect test data or missing query parameters that caused initial test failures. All corrected in `t012.spec.ts` during T-012 execution.

## Corrections Applied

### TC-BFF-024 (GET /fiscal-years)
- **Issue:** Test called `GET /fiscal-years` without required `companyId` query parameter. `ListFiscalYearsQuerySchema` requires `companyId: NonEmptyStr` — omitting it triggers Zod 400.
- **Fix:** Added `.query({ companyId: 'comp-001' })`. Test now returns 200 with fy-2026.

### TC-BFF-026 (POST /accounts create)
- **Issue:** Test used `code: '1-TEST-0001-000-01'` which fails the backend CODE_PATTERN `/^\d+-\d+-\d+-\d+-\d+$/` (requires all-digit segments).
- **Fix:** Changed to `code: '1-100-0001-001-01'`. Test returns 201.

### TC-BFF-027 (PUT /accounts update)
- **Issue:** Same root cause as TC-BFF-026 — account creation step used invalid code `'1-TEST-0002-000-01'`.
- **Fix:** Changed to `code: '1-100-0002-001-01'`. Test returns 201 for create, 200 for update.

## Recommended Action
Update the TC markdown specs (TC-BFF-024.md, TC-BFF-026.md, TC-BFF-027.md) to reflect the corrected test data. No backend changes required.
