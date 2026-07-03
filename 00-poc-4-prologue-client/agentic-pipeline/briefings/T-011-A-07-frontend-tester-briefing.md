# T-011 Briefing — A-07 Frontend Test Execution
Sprint: sprint-01 | Date: 2026-05-24 | Rework Cycle: 1 (post T-007)

## Task
Run the FE test suite against the T-007-reworked frontend codebase.
Write `defect-summary-fe.json` (A-00 reads this to decide rework).

## Pre-condition check (already done)
H-07 hook returned PROCEED. T-004 [x] T-006 [x] T-007 [x] T-008 [x] all confirmed.

## What exists
- `app/frontend/src/test/t009.spec.ts` — 34 scaffolded tests (all `expect(true).toBe(true)`)
  - 5 are Playwright-only: TC-FE-003, TC-FE-008, TC-FE-012, TC-FE-017, TC-FE-022
  - All others are vitest-runnable stubs
- `app/frontend/src/test/smoke.test.tsx` — 10 REAL tests covering:
  - StatusBadge (2 tests), BalanceFooter (2), RecordNavToolbar (1), LineItemsGrid (1),
    CompanySelect (2), RoutesPage drift check (1)
- Total current vitest suite: 44 tests (verified passing in T-007 rework)

## Execution steps
1. Update t009.spec.ts: change 5 Playwright-only `it()` to `it.skip()`:
   - TC-FE-003, TC-FE-008, TC-FE-012, TC-FE-017, TC-FE-022
2. Run vitest from app/frontend:
   ```
   cd app/frontend
   npx vitest run --reporter=json --outputFile=../../sprints/sprint-01/tests/fe/test-output.json
   ```
3. Parse test-output.json for numPassedTests, numFailedTests, failures
4. For each failing test: write DEF-FE-###.md with owner tag
5. Write failures-fe.md (if any failures)
6. Write defect-summary-fe.json

## Key knowledge — T-007 rework changes that may affect tests
- JEHeaderPage, JEListPage, JEFormPage now use `useLoaderData()` (RR7 data router)
- StatusAuditPanel now uses `useFetcher()` — needs `createMemoryRouter` for tests
- LineItemsGrid error strings now use `t('errors.*')` from i18n
- `jeHeaderAction`, `jeFormAction`, `jeListLoader` etc. exported from page files
- RoutesPage drift check: route-inventory.ts updated with `via: 'loader'/'action'`
  This may pass or fail depending on whether route-inventory.ts was correctly updated.

## Output paths
- `sprints/sprint-01/tests/fe/test-output.json` (vitest JSON output)
- `sprints/sprint-01/tests/fe/failures-fe.md` (FAIL verdicts only)
- `DEF-FE-###.md` files in `sprints/sprint-01/tests/fe/defects/` per real defect
- **`sprints/sprint-01/tests/fe/defect-summary-fe.json`** (A-00 reads ONLY this)

## defect-summary-fe.json format
```json
{
  "task": "T-011",
  "sprint": "sprint-01",
  "totalDefects": N,
  "byOwner": { "A-04": 0, "shared": 0 },
  "bySeverity": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "reworkRequired": false,
  "defects": []
}
```
reworkRequired = true only if there are High or Critical defects.
