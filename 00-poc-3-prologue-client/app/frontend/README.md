# Prologue General Ledger — Frontend

React 18 + Vite SPA for the Prologue GL POC.  
Sprint 01 · T-004 · A-04 Frontend Developer

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Bundler | Vite 5 |
| Language | TypeScript 5.7 |
| Routing | React Router 7 (library mode) |
| Styling | Tailwind CSS 3.4 (Fiserv design tokens) |
| UI Primitives | Radix UI (Dialog, Label, Select) |
| Forms | react-hook-form + Zod |
| API Client | openapi-fetch (typed against `src/api/schema.ts`) |
| i18n | i18next + react-i18next |
| Mocking | MSW v2 (browser worker, `VITE_USE_MSW=1`) |
| Testing | Vitest + @testing-library/react |

## Quickstart

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

Enable offline mode (no backend needed):

```bash
VITE_USE_MSW=1 npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000` | BFF base URL |
| `VITE_USE_MSW` | `0` | Set `1` to enable MSW browser mocking |
| `VITE_DEV_TOKEN` | `dev-token` | Dev bearer token (bypassed by backend) |

## Scripts

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # tsc --noEmit + vite build
npm run test     # vitest run
npm run lint     # tsc --noEmit
```

## Routes

| Route | Component | CI Card |
|---|---|---|
| `/journal-entries` | JournalEntriesListPage | CI-001–007 |
| `/journal-entries/new` | JournalEntryPage (create) | CI-001–007 |
| `/journal-entries/:id` | JournalEntryPage (edit) | CI-001–007 |
| `/accounts` | AccountMaintenancePage | CI-017 |
| `/approval-queue` | ApprovalQueuePage | CI-008 (stub) |
| `/financial-review` | FinancialReviewPage | CI-009 (stub) |
| `/accruals-prepaid` | AccrualsPrepaidPage | CI-010 (stub) |
| `/allocation` | AllocationPage | CI-011 (stub) |
| `/report-designer` | FinancialReportDesignerPage | CI-012 (stub) |
| `/budget` | BudgetManagementPage | CI-013 (stub) |
| `/consolidation` | ConsolidationPage | CI-014 (stub) |
| `/fiscal-year-control` | FiscalYearControlPage | CI-015 (stub) |
| `/transaction-import` | TransactionImportPage | CI-016 (stub) |
| `/dev/routes` | RoutesPage | DEV |

## Architecture

```
src/
├── api/
│   ├── schema.ts          # openapi-fetch paths + domain types
│   ├── client.ts          # apiClient instance
│   ├── msw-handlers.ts    # MSW request handlers (node-safe, handlers only)
│   └── msw-browser.ts     # MSW browser worker (browser-only)
├── components/            # Shared UI: Button, Field, DataTable, Modal, ...
├── dev/                   # Dev-only: route inventory + RoutesPage
├── features/
│   ├── journal/           # JournalEntriesListPage, JournalEntryPage
│   ├── accounts/          # AccountMaintenancePage
│   └── stubs/             # ComingSoonPage wrappers (CI-008–016)
├── layouts/               # AdminShell (header + sidebar)
├── locales/en.json        # All i18n strings
├── styles/globals.css     # Tailwind base + component classes
├── test/                  # Vitest + Testing Library specs
├── i18n.ts                # i18next init
├── main.tsx               # App bootstrap
└── routes.tsx             # createBrowserRouter definition
```

## Testing

```bash
npm test
```

11 tests across 3 suites (RoutesPage, JournalEntriesListPage, JournalEntryPage).
