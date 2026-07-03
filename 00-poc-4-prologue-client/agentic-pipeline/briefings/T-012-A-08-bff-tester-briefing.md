# T-012 Briefing — A-08 BFF Test Execution
Sprint: sprint-01 | Date: 2026-05-24 | Rework Cycle: 1 (post T-007)

## Task
Run the BFF test suite against the T-007-reworked backend.
Write `defect-summary-bff.json` (A-00 reads this to decide rework).

## Pre-condition check (already done)
H-08 hook returned PROCEED. T-005 [x] T-006 [x] T-007 [x] T-008 [x] all confirmed.

## What exists
- `sprints/sprint-01/tests/bff/t010.spec.ts` — 35 scaffolded supertest tests
  - Written by A-08 in T-010; needs to be COPIED to `app/backend/src/test/t010.spec.ts`
  - Original has `let app: any;` with NO beforeAll initialization
  - Seed factory imports are commented out
- `app/backend/src/test/setup.ts` — exports `buildTestApp()` (calls `buildApp({ reseed: true })`)
- `app/backend/src/store/seed.ts` — exports factory functions:
  `validJournalEntryPayload`, `validUpdateJournalEntryPayload`,
  `validLineItemPayload`, `validUpdateLineItemPayload`,
  `validAccountCode`, `validNavigationQuery`

## Seed data facts (critical for correct test expectations)
- Seeded JEs: journalId 1 (Unposted balanced), 2 (Posted), 3 (Unposted unbalanced),
  4 (Unposted empty), 5 (Unposted single debit 500), 6 (Unposted balanced 300/300),
  7 (Posted), 8 (Unposted balanced), 10 (Unposted empty)
- Total JEs: **9** (IDs 1-8 and 10; 9 is burned/skipped)
- Sorted by journalNumber asc (default): JE 1(1001) → JE 10(1009)
- Line IDs: JE1→lineId=1,2; JE2→3,4; JE3→5; JE5→6; JE6→7,8; JE7→9,10; JE8→11,12
- Companies: '0004' (0004_company), '0005' (Alpha Corp), '0006' (Beta Holdings)

## Known test issues to fix before creating app/backend/src/test/t010.spec.ts

1. **TC-BFF-027** (expects 400 for already-posted): After T-007 CR-BE-001,
   `postJournalEntry` now throws `conflict()` → **409**. Update: `expect(res.status).toBe(409)`

2. **TC-BFF-029** (totalCount=3): Seed has 9 JEs, so totalCount is **9**.
   Update: `expect(res.body.totalCount).toBe(9)`

3. **TC-BFF-030** (isLast=true for journalId=3): journalId=3 is NOT the last entry
   (journalId=10 is last). Update last-record test to use journalId=10:
   ```
   const last = await request(app).get('/journal-entries/10/navigation')...
   expect(last.body.isLast).toBe(true);
   expect(last.body.nextJournalId).toBeNull();
   ```

4. **TC-BFF-024** (DELETE /journal-entries/6/lines/1): lineId=1 belongs to JE 1,
   not JE 6. JE 6's lines are lineId=7 (debit 300) and lineId=8 (credit 300).
   Update: `delete('/journal-entries/6/lines/7')`

## Execution steps
1. Create `app/backend/src/test/t010.spec.ts`:
   - Start from `sprints/sprint-01/tests/bff/t010.spec.ts`
   - Add: `import { buildTestApp } from './setup.js';`
   - Add: `import { validJournalEntryPayload, validLineItemPayload } from '../store/seed.js';`
   - Wire: `beforeAll(() => { app = buildTestApp(); })`
   - Apply all 4 fixes above
2. Run vitest from app/backend:
   ```
   cd app/backend
   npx vitest run --reporter=json --outputFile=../../sprints/sprint-01/tests/bff/test-output.json
   ```
3. Parse test-output.json for failures
4. For each failing test that is a REAL code bug: write DEF-BFF-###.md with owner tag
5. Write failures-bff.md (if any failures)
6. Write defect-summary-bff.json

## Output paths
- `sprints/sprint-01/tests/bff/test-output.json` (vitest JSON output)
- `sprints/sprint-01/tests/bff/failures-bff.md` (FAIL verdicts)
- `DEF-BFF-###.md` files in `sprints/sprint-01/tests/bff/defects/` per real defect
- **`sprints/sprint-01/tests/bff/defect-summary-bff.json`** (A-00 reads ONLY this)

## defect-summary-bff.json format
```json
{
  "task": "T-012",
  "sprint": "sprint-01",
  "totalDefects": N,
  "byOwner": { "A-05": 0, "shared": 0 },
  "bySeverity": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "reworkRequired": false,
  "defects": []
}
```
reworkRequired = true only if High or Critical defects exist.
