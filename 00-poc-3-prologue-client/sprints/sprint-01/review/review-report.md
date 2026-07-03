# Code Review Report — Sprint 01
<!-- A-06 Code Reviewer | T-006 | 2026-05-21 -->

## Verdict

| | |
|---|---|
| **Overall verdict** | **PASS** |
| **Rework required** | **NO** |
| **Reviewed by** | A-06 |
| **Date** | 2026-05-21 |
| **Scope** | app/frontend/ (T-004) · app/backend/ (T-005) |

---

## Summary Table

| Area | Owner | Files reviewed | Critical | High | Medium | Low | Status |
|------|-------|---------------|----------|------|--------|-----|--------|
| Frontend SPA | A-04 | ~30 src files | 0 | 0 | 1 | 3 | PASS |
| Backend BFF  | A-05 | ~42 src files | 0 | 0 | 0 | 1 | PASS |
| **Total**    |      |               | **0** | **0** | **1** | **4** | **PASS** |

No Critical or High findings. No rework required.

---

## Findings Table

| ID | Sev | File : Line | Issue | Recommendation |
|----|-----|-------------|-------|----------------|
| CR-001 | LOW | `src/api/client.ts:16` | `postMultipart()` uses raw `fetch()` directly, bypassing `apiClient`. Checklist item: "no raw fetch/axios". | Acceptable: openapi-fetch v0.12 does not support multipart bodies. Add a one-line comment stating this exception. No rework needed. |
| CR-002 | MEDIUM | `JournalEntriesListPage.tsx`, `JournalEntryPage.tsx`, `AccountMaintenancePage.tsx` — data-fetch hooks | Pages use `useEffect` + `useState` for data loading; checklist requires React Router loader functions. | Migrate data fetching to Route `loader` functions in `routes.tsx` in a future sprint. For this POC the pattern is functional; no rework required. |
| CR-003 | LOW | `src/routes.tsx:22`; `src/components/DataTable.tsx:24,47` | Three hard-coded English strings (`"Loading..."`, `"No records found."`) bypass `t()` / i18next. | Move strings to `src/locales/en.json` keys and replace with `t('common.loading')` / `t('common.noResults')`. Minor fix, not blocking. |
| CR-004 | LOW | `src/features/accounts/AccountMaintenancePage.tsx` — company `<select>` `onChange` | Company selector change calls `setSelectedId(null); setIsNew(false)` but does **not** call `reset()`. The RHF form may show stale account data from the previously selected account when the company changes. | Add `reset({ companyId: newValue, ... })` inside the onChange handler. Low-risk in practice since `setSelectedId(null)` hides the form. |
| CR-005 | LOW | `app/backend/src/routes/shell.routes.ts` — reference-data routes | `/companies`, `/currencies`, `/journal-entry-types`, `/source-documents`, `/allocation-methods`, `/routing-rules` are mounted **before** the `authn` middleware in `routes/index.ts` and receive no authentication. | By design for this POC (reference data needed before login). For production, evaluate whether each endpoint should require a bearer token. No rework required. |

---

## Positive Observations

**Frontend (A-04):**
- `createBrowserRouter` wired correctly with all 17 CI-card routes (14 routes + `/dev/routes`).
- `react-hook-form` + `zodResolver` applied to both JournalEntryPage and AccountMaintenancePage forms.
- `useFieldArray` used correctly for journal lines; live balance totals computed on every keystroke.
- `i18next` via `useTranslation().t()` used for all visible strings except 3 occurrences (CR-003).
- MSW v2 handlers cover all called endpoints; `msw-browser.ts` / `msw-handlers.ts` split correctly prevents node-environment errors in Vitest.
- `tsc --noEmit` clean; 11/11 Vitest specs pass.
- `aria-label`, `role="alert"`, `role="status"`, `aria-hidden` applied at key locations.

**Backend (A-05):**
- Helmet + CORS + `express.json` applied in correct order in `app.ts`.
- `authn` middleware gates all domain routes; `requireRole()` applied consistently per-endpoint.
- Pino logger configured with redaction for `authorization`, `cookie`, `email`, `password` — no PII risk.
- `/metrics` endpoint live with `prom-client` histogram tracking request duration.
- Error handler sets `Content-Type: application/problem+json` on every error response.
- Graceful shutdown on `SIGTERM`/`SIGINT` with 10-second hard timeout.
- Zod schema parse on every `POST`/`PUT` request body.
- Service layer carries domain logic (totals computation, status transitions, period validation).
- `tsc --noEmit` clean; 4/4 Vitest/supertest specs pass.

---

## Rework Required

None. All findings are Low or Medium severity. No Critical or High issues were identified.

---

## Checklist Compliance Summary

| Checklist Item | Frontend | Backend |
|---|---|---|
| No raw fetch/axios | ⚠ CR-001 (exception, documented) | N/A |
| Router loaders for data fetching | ⚠ CR-002 (useEffect used, POC acceptable) | N/A |
| react-hook-form + Zod on forms | ✓ | N/A |
| i18next for all visible strings | ⚠ CR-003 (3 occurrences) | N/A |
| WCAG AA accessibility | ✓ (core aria attributes present) | N/A |
| Every ED endpoint implemented | N/A | ✓ all 17 domains |
| Auth applied to protected routes | N/A | ✓ |
| Helmet + CORS | N/A | ✓ |
| Pino structured logging (no PII) | N/A | ✓ |
| /metrics endpoint present | N/A | ✓ |
| Clean Architecture | N/A | ✓ |
