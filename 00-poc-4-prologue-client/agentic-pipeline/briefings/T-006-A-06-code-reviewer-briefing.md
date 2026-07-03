# T-006 Briefing — A-06 Code Reviewer
# Sprint: sprint-01 | Task: T-006 | Generated: 2026-05-24

## Orchestrator Answers (Protocol 1)

1. **Input paths for T-006**
   - Frontend source: `app\frontend\src\` (49 files excluding node_modules/dist)
   - Backend source: `app\backend\src\` (44 files excluding node_modules/dist)
   - Contract refs: `sprints\sprint-01\endpoint-design\` (ED-001..ED-010)
   - Requirement refs: `sprints\sprint-01\req-outputs\` (RC-001..RC-010)

2. **Output path for T-006**
   - `sprints\sprint-01\review\review-report.md` (human-readable)
   - `sprints\sprint-01\review\review-summary.json` (machine-readable routing)
   - `sprints\sprint-01\review-inputs\code-review\CR-*.md` (per-finding files)

3. **T-004 and T-005 status**
   - T-004 [x] — Frontend complete: tsc clean, 44/44 vitest pass, Vite boot OK
   - T-005 [x] — Backend complete: tsc clean, 14/14 vitest pass, dev boot OK
   - H-06 hook: PROCEED (no prior review hash — first run)

4. **Context briefing**
   - 93 reviewable files total (49 FE + 44 BE) — under 100-file Case B threshold → foreground only
   - Sprint goal: GL Prologue Client (Journal Entry header/form, navigation, company selection)
   - Stack: React 18 + React Router 7 + openapi-fetch + react-hook-form/Zod + i18next + Tailwind (FE); Fastify + Pino + Zod + JWT + prom-client (BE)

## Key Implementation Decisions (A-04 + A-05 notes)

### Backend (A-05)
- 23 endpoints: ED-001..008 (13 routes), 5 deferred stubs (ED-009/010), 5 public ops
- `AUTH_DEV_BYPASS=1` for dev; JWT middleware in prod path
- `app/backend/.env` created from `.env.example` (ENV_CREATED_HB — confirmed OK)
- pino-http v10 type mismatch fixed: uses inline pino options (no `logger:` prop)
- TC-BFF-029 seed count: seed has 9 JEs; TC expects totalCount=3 — non-blocking, A-08 to adjust

### Frontend (A-04)
- `VITE_USE_MSW=0` — frontend calls real BFF at http://localhost:4000
- `app/frontend/.env` created from `.env.example` (ENV_CREATED_HB — confirmed OK, VITE_USE_MSW=0)
- RecordNavToolbar MSW test: uses vi.spyOn (jsdom fetch not intercepted by @mswjs/interceptors)
- Circular dep warning: routes.tsx ↔ RoutesPage.tsx (dev-only RoutesPage component in production router — non-blocking for POC)
- react-hook-form + zodResolver on all forms; debit/credit mutual exclusion on LineItemsGrid
- All user strings in src/locales/en.json via useTranslation()

## Critical Review Focus Areas

1. **ED response-shape check** (mandatory per A-06 definition): For each backend route, compare actual return value to ED-###.md "Response Model" table. Flag any mismatch as Critical.
2. **Auth coverage**: Verify every non-public endpoint applies JWT middleware (or AUTH_DEV_BYPASS).
3. **No raw fetch/axios in frontend**: All BFF calls MUST go through `apiClient` (openapi-fetch wrapper in `src/api/client.ts`).
4. **React Router loaders vs useEffect**: Check for useEffect+fetch patterns (should use loaders).
5. **i18next completeness**: No hardcoded user-facing strings.
6. **Clean Architecture (BE)**: routes → controllers → services → store; no cross-layer skips.
7. **PII in logs**: No user data in Pino structured log calls.

## Deferred Items (scope-limited — do NOT raise as findings)
- RC-009 (Edit JE) and RC-010 (Post JE): only stubs implemented (CI-009/010, ED-009/010 Deferred)
- TC-BFF-029 seed count mismatch — A-08's concern, not A-06's
- RoutesPage circular dep warning — dev-only, POC scope

## Finding ID Convention
- Frontend findings: `CR-FE-001`, `CR-FE-002`, ...
- Backend findings: `CR-BE-001`, `CR-BE-002`, ...
- Shared findings: `CR-SHARED-001`, ...
- Infrastructure/pipeline findings: `CR-OTHER-001`, ... (owner: other — not acted on in T-007)

## Output Requirements (mandatory)
1. `review-report.md` — verdict PASS or FAIL; rework YES or NO
2. `review-summary.json` — must include totalFindings, byOwner, byCriticality, reworkRequired, verdict
3. Per-finding CR-*.md files with: id, category, owner (A-04|A-05|shared|other), severity, location, reviewer, date, ## Comment, ## Suggested fix
