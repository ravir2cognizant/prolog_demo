# T-004 Briefing — A-04 Frontend Developer
Sprint: sprint-01 | Task: T-004 | Phase: Frontend Implementation
Date: 2026-05-23 | Hook result: PROCEED (T-005 complete before this task activates)

## Paths
- Input CI: `sprints\sprint-01\component-inventory\` (CI-001..010; CI-009/010 deferred stubs)
- Input ED: `sprints\sprint-01\endpoint-design\` (ED-001..010)
- Input RC: `sprints\sprint-01\req-outputs\` (RC-001..010; acceptance criteria reference)
- Input style: `sprints\sprint-01\ui-style-outputs\` (tokens.json, tailwind.theme.json, style-system.md, components.css)
- FE test cases: `sprints\sprint-01\tests\fe\test-cases\TC-FE-001..034.md` (T-009 complete)
- FE spec scaffold: `sprints\sprint-01\tests\fe\t009.spec.ts` → copy to `app\frontend\src\test\t009.spec.ts`
- Output: `app\frontend\` (accumulates across sprints)
- Hash file: `app\frontend\.input-hash-sprint-01`

## Dependency Note
H-04 requires T-005[x] before PROCEED. This briefing is pre-written; A-04 spawns only after A-05 reports task-complete. On activation, run H-04 hook to confirm PROCEED before writing any code.

## Scope
**In scope:** CI-001..CI-008 — implement each component/page.
**Deferred stubs:** CI-009/010 — route to `<ComingSoonPage/>`.

## Component Inventory Summary

### CI-001 — AppSidebar / NavMenu (→ ED-001)
Left panel with `AppSidebar` root, `SidebarHeader`, `SidebarSearch`, collapsible `NavSection[]`, `NavSubItem[]`.
- Data: `GET /navigation/menu` via React Router loader
- States: collapsed/expanded, active (left border brand.green), hover, alert dot, disabled
- Animation: expand/collapse ≤ 200ms (`motion.duration.normal`)
- A11y: `<nav>`, `aria-expanded`, `aria-current="page"` on active item

### CI-002 — JE Header (read mode, → ED-002)
Displays all 16 JE header fields (2-column grid layout) + status badge.
- Data: `GET /journal-entries/:journalId` via loader
- Status badge colours: "Unposted" → grey; "Posted" → brand.green semantic
- All fields read-only in this component

### CI-003 — JE Form (create/edit, → ED-003)
react-hook-form + Zod for all inputs; zodResolver.
- POST /journal-entries (create); PUT /journal-entries/:journalId (edit)
- **Company lock:** companyId field disabled on edit (locked post-creation, OQ-004b)
- **Posted JE:** all fields read-only when status === "Posted"
- Required: companyId, journalEntryTypeId, transactionDate, description
- description max 500 chars
- Company/type dropdowns populated via `GET /reference/companies` and `GET /reference/journal-entry-types`
- Inline validation errors via `Field` component's `error` slot + `role="alert"`

### CI-004 — Line Items Grid (CRUD + account lookup, → ED-004)
Editable data grid; one row per line item.
- **Debit/credit mutual exclusion:** when debitAmount > 0, creditAmount input is disabled (and vice versa). Clearing the set field re-enables the other. Both = 0 allowed. (P1 — TC-FE-015)
- **Account lookup autopopulate:** entering accountCode calls `GET /accounts/:accountCode` and populates accountDescription; ≤ 500ms NFR (TC-FE-017)
- Line CRUD: POST .../lines (201), PUT .../lines/:lineId (200), DELETE .../lines/:lineId (204)
- `lineNumber` is auto-assigned by BFF; display read-only
- A11y: full keyboard nav in grid (TC-FE-018)

### CI-005 — Balance Footer (client-side, → ED-005)
Real-time totals below line items grid.
- **No BFF call for display** — calculates totalDebits/totalCredits/difference from local line items state
- Recalculates within ≤ 100ms of any line item change (TC-FE-021)
- `balanced: boolean` → shows "Balanced" (brand.green) or "Difference: [amount]" (semantic.error)
- `aria-live="polite"` region for screen reader announcements (TC-FE-022)
- Totals are confirmed by BFF response bodies on mutation (POST/PUT/DELETE lines return updated totals)

### CI-006 — Status, Audit Trail, Post Entry Button (→ ED-006)
Status badge + audit trail table + PostEntryButton.
- **Post button disabled** when `balanced === false` (TC-FE-023)
- **Post button hidden** when status === "Posted" (TC-FE-024)
- **Audit trail fields** read-only; never editable (TC-FE-025)
- Post action: POST /journal-entries/:journalId/post → 200 on success; 422 unbalanced; 409 already posted
- After successful post: update status display + hide post button

### CI-007 — Record Navigation Toolbar (→ ED-007)
Previous/Next/First/Last navigation between JE records.
- Data: `GET /journal-entries/:journalId/navigation` (query: sortField, sortOrder, companyId?)
- **Boundary buttons disabled:** First/Prev disabled when `isFirst === true`; Last/Next disabled when `isLast === true` (TC-FE-028)
- A11y: descriptive labels ("Previous journal entry", not just "Prev") (TC-FE-030)

### CI-008 — Company Select (→ ED-008 / ED-003)
Company selection dropdown on JE create.
- Data: `GET /reference/companies`; populates within ≤ 500ms (TC-FE-033)
- Display format: `{companyId} — {companyName}` (TC-FE-031)
- **Disabled on edit** (company locked post-creation) (TC-FE-032)
- A11y: keyboard-navigable with accessible label (TC-FE-034)

## Technology Stack (mandatory — no deviations)
React 18 · React Router 7 (createBrowserRouter; loaders for reads, actions for writes) · TypeScript 5.9
Nx 22.2 monorepo · Tailwind CSS 3.3 (merge tailwind.theme.json into tailwind.config.js)
Radix UI / React Aria / Headless UI for accessible primitives
react-hook-form 7.49 + Zod 3.23 · openapi-fetch 0.13 (no raw fetch/axios)
i18next 25.3 (ALL user-facing strings through t(key); keys in src/locales/en.json)
Framer Motion 11.3 (for CI-001 expand animation) · Vitest 3.1 + Testing Library · MSW 2.2

## Design System (from ui-style-outputs/)
Brand colours: `brand.navy` #1A3A6B (header), `brand.green` #2D6A2D (primary CTAs + active state), `brand.blueActive` #2563EB (focus rings, interactive state)
Neutral scale: grey50 #F8FAFC (canvas), grey100 #F2F4F7 (sidebar bg), grey300 #D1D5DB (field borders)
Semantic: error #DC2626, success #16A34A
Font: Inter (fallback: ui-sans-serif); size.sm 14px; weight.semibold 600
Consume `tailwind.theme.json` colours verbatim — do NOT invent hex values.
Import `components.css` for pre-built utility classes (`.nav-item`, `.nav-item--active`, `.nav-alert-dot`, `.focus-ring`, etc.)

## File Structure
```
app/frontend/
  src/
    main.tsx · routes.tsx · i18n.ts · styles/globals.css
    api/{client.ts,types.ts,msw-handlers.ts}
    layouts/AdminShell.tsx
    components/{Button,Field,DataTable,StatusBadge,Modal,PageHeader,ComingSoonPage}.tsx
    features/
      navigation/NavMenuPage.tsx        (CI-001)
      journal-entry/
        JEHeaderPage.tsx                (CI-002)
        JEFormPage.tsx                  (CI-003)
        LineItemsGrid.tsx               (CI-004)
        BalanceFooter.tsx               (CI-005)
        StatusAuditPanel.tsx            (CI-006)
        RecordNavToolbar.tsx            (CI-007)
      company/CompanySelectPage.tsx     (CI-008)
    dev/{route-inventory.ts,RoutesPage.tsx}
    locales/en.json
    test/{setup.ts,*.test.tsx,t009.spec.ts}  ← copy t009.spec.ts from sprints/
  package.json · tsconfig.json · vite.config.ts · tailwind.config.js
  postcss.config.js · index.html · vitest.config.ts
  .env.example · .gitignore · project.json · README.md
  .input-hash-sprint-01
```

## Key Constraints
- **No raw `fetch()`** outside `postMultipart`. Use `openapi-fetch` `apiClient` for all BFF calls.
- **No `axios`.**
- **No inline English strings in JSX** — always `t('key')`.
- **No invented design tokens** — only use tokens from tailwind.theme.json.
- **No `console.log`** outside `src/test/` and `src/dev/`.
- Every route in `routes.tsx` MUST have a matching entry in `ROUTE_INVENTORY` (src/dev/route-inventory.ts).
- MSW handlers must cover every endpoint the app calls; `VITE_USE_MSW=1` must boot fully offline.
- WCAG AA: focus rings (`.focus-ring` class), keyboard nav, aria labels, sr-only fallbacks.

## Pre-Start Alignment Check (required)
Before writing any code, verify: "Can I implement each CI component using the data the ED endpoints return?" Report any mismatch to Orchestrator before proceeding.

## Env Bootstrap (SKILL — mandatory)
After writing `.env.example`, check if `app/frontend/.env` exists.
If absent: copy `.env.example` → `.env`; include `ENV_CREATED_HB` block; do NOT self-declare T-004 complete.
Dev defaults: `VITE_API_BASE_URL=http://localhost:4000`, `VITE_USE_MSW=1`, `VITE_DEV_TOKEN=dev-token`

## DoD Checklist
- [ ] Pre-start alignment check passed (no CI↔ED mismatches)
- [ ] CI-001..CI-008 implemented (real components or confirmed ComingSoonPage for stub)
- [ ] CI-009/010 → ComingSoonPage stubs
- [ ] All forms use react-hook-form + zodResolver; validation errors shown with role="alert"
- [ ] All BFF calls via apiClient (openapi-fetch); no raw fetch/axios
- [ ] Debit/credit mutual exclusion enforced (CI-004)
- [ ] Balance footer recalculates client-side ≤ 100ms (CI-005)
- [ ] Post button disabled when unbalanced; hidden when Posted (CI-006)
- [ ] Account lookup autopopulates accountDescription ≤ 500ms (CI-004)
- [ ] Company field locked on edit (CI-003, CI-008)
- [ ] Record navigation boundaries disable First/Prev and Next/Last correctly (CI-007)
- [ ] tailwind.theme.json merged into tailwind.config.js; components.css imported
- [ ] All user-facing strings through t(key); keys in src/locales/en.json
- [ ] MSW handlers cover all BFF endpoints; VITE_USE_MSW=1 boots offline
- [ ] /dev/routes page renders route inventory with zero drift warnings
- [ ] 4+ Vitest specs pass; t009.spec.ts copied to src/test/
- [ ] tsc --noEmit: 0 errors; vitest: all pass; npm run dev: boots at localhost:5173 no console errors
- [ ] .env.example with dev-friendly defaults + upper-env comments
- [ ] ENV_CREATED_HB block in completion report (if .env was new)
- [ ] .input-hash-sprint-01 written
- [ ] Report task-complete to Orchestrator with component count + BFF endpoint coverage
