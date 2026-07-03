# Briefing: T-004 Frontend Implementation -- Frontend Developer (A-04)
# Sprint: sprint-01 | Prepared by: A-00 | Date: 2026-05-21

## Task
Implement the React 18 + Vite SPA for the Prologue General Ledger POC in app/frontend/.
Implement all 17 CI card features (CI-001 -- CI-017), either as full implementations or ComingSoonPage stubs.

## Dependencies (all satisfied)
- T-GATE: [x] Complete -- all 6 agents signed off
- T-002:  [x] Complete -- 17 ED cards at sprints/sprint-01/endpoint-design/
- T-003a: [x] Complete -- tokens.json, tailwind.theme.json, style-system.md at sprints/sprint-01/ui-style-outputs/
- T-003b: [x] Complete -- 17 CI cards at sprints/sprint-01/component-inventory/

## Input Paths
- CI cards:        sprints/sprint-01/component-inventory/CI-001.md -- CI-017.md
- ED cards:        sprints/sprint-01/endpoint-design/ED-001.md -- ED-017.md
- Style outputs:   sprints/sprint-01/ui-style-outputs/ (tailwind.theme.json, style-system.md, tokens.json)
- RC cards:        sprints/sprint-01/req-outputs/RC-001.md -- RC-017.md

## Output Path
- app/frontend/ (NOT sprint-scoped -- accumulates across sprints)

## BFF Base URL
- Dev: http://localhost:4000 (AUTH_DEV_BYPASS=1 -- no real JWT needed)

## Route Map (CI -> Route -> Component)
| CI       | Route                       | Component                     | Status   |
|----------|-----------------------------|-------------------------------|----------|
| CI-001-007 | /journal-entries            | JournalEntriesListPage        | Real     |
| CI-001-007 | /journal-entries/new        | JournalEntryPage              | Real     |
| CI-001-007 | /journal-entries/:id        | JournalEntryPage              | Real     |
| CI-008   | /approval-queue             | ApprovalQueuePage             | Stub     |
| CI-009   | /financial-review           | FinancialReviewPage           | Stub     |
| CI-010   | /accruals-prepaid           | AccrualsPrepaidPage           | Stub     |
| CI-011   | /allocation                 | AllocationPage                | Stub     |
| CI-012   | /report-designer            | FinancialReportDesignerPage   | Stub     |
| CI-013   | /budget                     | BudgetManagementPage          | Stub     |
| CI-014   | /consolidation              | ConsolidationPage             | Stub     |
| CI-015   | /fiscal-year-control        | FiscalYearControlPage         | Stub     |
| CI-016   | /transaction-import         | TransactionImportPage         | Stub     |
| CI-017   | /accounts                   | AccountMaintenancePage        | Real     |
| dev      | /dev/routes                 | RoutesPage                    | Real     |

## Tech Stack
- React 18 + Vite 5
- React Router 7 (library mode, createBrowserRouter)
- TypeScript 5.7
- Tailwind CSS 3.4 (tailwind.theme.json merged into config)
- Radix UI (Dialog, Select, Label)
- react-hook-form + @hookform/resolvers/zod + Zod
- openapi-fetch (typed API client)
- i18next + react-i18next (every visible string via t())
- MSW v2 (VITE_USE_MSW=1 for offline dev)
- Vitest + @testing-library/react (4+ tests)

## DoD Checklist
- [ ] All 17 CI routes resolve (real or ComingSoonPage stub)
- [ ] react-hook-form + zodResolver on all forms
- [ ] apiClient for all BFF calls; postMultipart for file uploads only
- [ ] /dev/routes renders route + endpoint inventory
- [ ] tailwind.theme.json from ui-style-outputs/ merged into tailwind.config.js
- [ ] src/locales/en.json has every visible string key
- [ ] MSW handlers cover all called endpoints; VITE_USE_MSW=1 boots offline
- [ ] 4+ Vitest specs pass
- [ ] npm install && npm run dev at http://localhost:5173 with no console errors
- [ ] No raw fetch/axios; no inline English strings; no raw hex colours
- [ ] .sprint-01.input-hash produced
