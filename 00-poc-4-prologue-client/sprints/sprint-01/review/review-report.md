# Code Review Report — Sprint-01

## Summary
| Field              | Value                          |
|--------------------|--------------------------------|
| Sprint             | sprint-01                      |
| Reviewer           | A-06 Code Reviewer             |
| Date               | 2026-05-24                     |
| Files reviewed     | 93 (49 FE + 44 BE)             |
| Total findings     | 6                              |
| Critical findings  | 0                              |
| High findings      | 2                              |
| Medium findings    | 2                              |
| Low findings       | 1                              |
| Info findings      | 1                              |
| Verdict            | **FAIL**                       |
| Rework required    | **YES** (CR-FE-001, CR-FE-002, CR-BE-001) |

---

## Findings Table

| ID          | Severity | Owner | File                                                     | Line   | Issue                                                                  | Recommendation                                          |
|-------------|----------|-------|----------------------------------------------------------|--------|------------------------------------------------------------------------|---------------------------------------------------------|
| CR-FE-001   | High     | A-04  | JEHeaderPage.tsx, JEListPage.tsx, JEFormPage.tsx         | 30,19,79 | useEffect+apiClient pattern instead of React Router 7 loaders         | Migrate to loaders + `useLoaderData()` + `useRevalidator()` |
| CR-FE-002   | High     | A-04  | JEFormPage.tsx, StatusAuditPanel.tsx                     | 121,27 | Direct apiClient calls in submit/click handlers instead of RR actions | Use React Router `<Form>` + `action` + `useFetcher()` for post |
| CR-FE-003   | Medium   | A-04  | JEHeaderPage, JEListPage, JEFormPage, LineItemsGrid, StatusAuditPanel | 34–146 | 10 hardcoded English error strings not using i18next                  | Add `errors.*` keys to en.json; replace literals with `t()` |
| CR-BE-001   | Medium   | A-05  | journal-entry.service.ts                                 | 156    | `postJournalEntry` throws `badRequest` (400) for "already posted"; ED-006 declares 409 Conflict | Change `badRequest(...)` → `conflict(...)` (one-line fix) |
| CR-FE-004   | Low      | A-04  | JEListPage.tsx                                           | 62     | Hardcoded "Total: " display label; should use i18next                 | Add `je.list.totalCount` key with `{{count}}` interpolation |
| CR-BE-002   | Info     | A-05  | asyncHandler.ts                                          | 19–22  | Redundant if/else — both branches call `res.json(result)` (dead code) | Simplify to single `res.json(result)` call; no rework required |

---

## Positive Observations

- **No ED response-shape drift**: All 8 full-design endpoints match their ED-###.md Response Model tables exactly. ✅
- **Auth coverage**: `authn` middleware applied globally before all protected routes. Public routes (healthz, readyz, metrics, api-docs) correctly placed before the guard. ✅
- **Security baseline**: Helmet + CORS configured; x-powered-by disabled; Pino PII redaction on authorization, cookie, email, displayName fields. ✅
- **prom-client /metrics**: Present at `/metrics`, histogram with route/method/status labels. ✅
- **Clean Architecture (BE)**: routes → asyncHandler (thin controller layer) → services → memoryStore. No cross-layer violations. ✅
- **openapi-fetch client (FE)**: Zero raw fetch() or axios calls found. All BFF communication through `apiClient` wrapper. ✅
- **react-hook-form + Zod (FE)**: JEFormPage correctly uses `zodResolver` with field-level validation and `aria-invalid` + `role="alert"` error display. ✅
- **Debit/credit mutual exclusion (CI-004)**: Correctly applied to both persisted and draft lines in LineItemsGrid. ✅
- **Post button state machine (CI-006)**: `disabled={!entry.balanced || isPosting}` + hidden when Posted — matches CI-006 spec. ✅
- **i18next baseline**: 130+ user-facing strings correctly use `t()` via `useTranslation()`. Exceptions are error messages only (CR-FE-003). ✅
- **WCAG AA baseline**: `aria-label`, `aria-required`, `aria-invalid`, `role="alert"`, `aria-live="polite"` (BalanceFooter) all present. ✅
- **Deferred stubs**: ED-009/010 correctly return 501 Not Implemented with justification payload. ✅

---

## Rework Required (High and Medium findings)

| Finding ID  | Severity | Owner | File                        | Issue Summary                                        |
|-------------|----------|-------|-----------------------------|------------------------------------------------------|
| CR-FE-001   | High     | A-04  | JEHeaderPage, JEListPage, JEFormPage | useEffect instead of React Router loaders       |
| CR-FE-002   | High     | A-04  | JEFormPage, StatusAuditPanel | Direct mutation calls instead of RR actions          |
| CR-FE-003   | Medium   | A-04  | Multiple FE files           | Hardcoded error strings — add i18next keys           |
| CR-BE-001   | Medium   | A-05  | journal-entry.service.ts    | 400 vs 409 for "already posted" — one-line fix       |

Note on CR-FE-001 and CR-FE-002: The loader/action migration is the largest rework item. For A-04 rework in T-007: sub-component-level fetches (RecordNavToolbar, LineItemsGrid CRUD) are explicitly out of scope — only route-level page components (JEHeaderPage, JEListPage, JEFormPage) require migration to loaders, and only the JEFormPage submit + StatusAuditPanel post action require migration to React Router actions.

CR-BE-001 is a one-line fix: `badRequest` → `conflict` in `journal-entry.service.ts:156`. Import `conflict` from `../util/errors.js`.

---

## Severity Definitions

| Level    | Criteria                                                        |
|----------|-----------------------------------------------------------------|
| Critical | Security vulnerability, data loss risk, auth bypass, PII in log |
| High     | Incorrect implementation against design spec, broken checklist item |
| Medium   | Semantic bug, missing compliance requirement, code quality issue |
| Low      | Style, naming, minor i18n gap                                   |
| Info     | Cosmetic / dead code — no rework required                       |
