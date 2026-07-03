# T-007 Rework Briefing — A-04 + A-05
Sprint: sprint-01 | Date: 2026-05-24 | Rework Cycle: 1

## Context
T-006 Code Review returned FAIL (review-summary.json: reworkRequired=true).
4 findings assigned to A-04 (FE), 2 to A-05 (BE).
No critical findings. All mandatory rework is High + Medium severity.

## Sprint State at Rework Entry
- T-004 [x]: Frontend impl complete (44/44 vitest, tsc 0 errors, dev OK :5173)
- T-005 [x]: Backend impl complete (14/14 vitest, tsc 0 errors, dev OK :4000)
- T-006 [x]: Code review complete — FAIL, rework=YES
- T-007 [ ]: THIS TASK — rework (foreground, sequential: FE then BE)

## Input Paths
- Review comments: sprints\sprint-01\review-inputs\code-review\CR-*.md
- Frontend source: app\frontend\src\
- Backend source: app\backend\src\

## Output Paths
- FE ledger: sprints\sprint-01\review-outputs\A-04-ledger.json
- BE ledger: sprints\sprint-01\review-outputs\A-05-ledger.json
- Review outputs dir: sprints\sprint-01\review-outputs\  (create if absent)

---

## A-04 — Frontend Rework Scope

### CR-FE-001 (High) — useEffect → React Router 7 loaders
**Files**: JEHeaderPage.tsx, JEListPage.tsx, JEFormPage.tsx
**Issue**: Each page uses `useEffect` + `apiClient.GET(...)` for initial data fetch.
RR7 requires route-level loaders for data reads.

**Fix**:
1. In each page file, export an `async function <PageName>Loader({ params })` that calls `apiClient.GET(...)` and returns the data.
2. Replace `useEffect` + `useState` data state with `const data = useLoaderData()`.
3. Wire the loader into `src/routes.tsx` under the corresponding route object (`loader: <PageName>Loader`).
4. For mutations/refetch after submit: use `useRevalidator()` where needed.
5. Sub-component-level fetches (RecordNavToolbar, LineItemsGrid CRUD) are OUT OF SCOPE — do NOT migrate those.

### CR-FE-002 (High) — Direct mutation calls → React Router actions
**Files**: JEFormPage.tsx (submit handler ~line 121), StatusAuditPanel.tsx (post action ~line 27)
**Issue**: Submit and post-action handlers call `apiClient.POST/PATCH` directly.
RR7 requires route actions for mutations.

**Fix for JEFormPage submit**:
1. Export an `async function jeFormAction({ request, params })` that reads `await request.formData()`, calls `apiClient.POST/PATCH`, returns result or throws redirect.
2. Replace the submit handler with a RR7 `<Form method="post">` that encodes the Zod-validated form data.
3. Use `useFetcher()` or `useNavigation()` for loading state.

**Fix for StatusAuditPanel post button**:
1. Export an action or use `useFetcher()` to call the POST /journal-entries/:id/post endpoint.
2. Replace direct `apiClient.POST` call with `fetcher.submit()` targeting the action.

### CR-FE-003 (Medium) — Hardcoded English error strings → i18next
**Files**: JEHeaderPage, JEListPage, JEFormPage, LineItemsGrid, StatusAuditPanel
**Issue**: ~10 hardcoded English error strings in JSX/catch blocks not using `t()`.

**Fix**:
1. Add `errors.*` keys to `src/locales/en.json` for all identified strings.
2. Replace every hardcoded English error literal with `t('errors.key')`.
3. Review all catch blocks, error state renders, and fallback messages across the 5 files.

### CR-FE-004 (Low) — Hardcoded "Total: " label → i18next
**File**: JEListPage.tsx (~line 62)
**Issue**: `"Total: "` string literal in JSX not using `t()`.

**Fix**:
1. Add key `"je.list.totalCount": "Total: {{count}}"` (or similar) to `src/locales/en.json`.
2. Replace `"Total: "` with `t('je.list.totalCount', { count: total })`.

---

## A-05 — Backend Rework Scope

### CR-BE-001 (Medium) — badRequest → conflict for already-posted JE
**File**: app\backend\src\services\journal-entry.service.ts:155-157
**Issue**: `throw badRequest('Journal entry is already posted')` returns HTTP 400.
ED-006 declares 409 Conflict for this scenario.

**Fix** (one-line change):
```ts
// Before
throw badRequest('Journal entry is already posted');
// After
throw conflict('Journal entry is already posted');
```
Also add `import { conflict } from '../util/errors.js'` if not already imported.

### CR-BE-002 (Info) — Redundant if/else in asyncHandler.ts (optional)
**File**: app\backend\src\controllers\asyncHandler.ts:19-22
**Note**: Info level — no rework required. Address opportunistically if the file is touched.
Suggested simplification: remove the if/else, keep single `res.json(result)` call.

---

## Verification Gates (each agent runs after their rework)

### A-04 (FE)
```
cd app\frontend
npm run build  (or tsc --noEmit)
npx vitest run
npm run dev    (smoke check: app loads, no console errors)
```
Target: tsc 0 errors, all vitest pass, dev boots OK.

### A-05 (BE)
```
cd app\backend
npx tsc --noEmit
npx vitest run
npm run dev    (smoke check: GET /healthz → 200)
```
Target: tsc 0 errors, all vitest pass, dev boots OK.

---

## Completion Criteria for T-007
- [ ] All CR-FE-001..004 addressed (or formally deferred with justification)
- [ ] CR-BE-001 fixed (one-line change)
- [ ] A-04-ledger.json + A-05-ledger.json written to review-outputs\
- [ ] FE: tsc 0, vitest all pass, dev boots
- [ ] BE: tsc 0, vitest all pass, dev boots
- [ ] T-007 marked [x] in orchestrator-manifest.md
- [ ] Audit log entry added

## Activation Order
1. A-04 (FE rework) — foreground, this session
2. A-05 (BE rework) — foreground, same session after A-04 done
