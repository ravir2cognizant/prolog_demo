---
id: TR-FE-018
tc-ref: TC-FE-018
verdict: NOT_RUN
executed-by: A-07
date: 2026-05-21
runner: vitest
---

# TR-FE-018 -- Account Maintenance: Search, Select, Edit, Save

## Verdict: NOT_RUN

## Reason
No automated Vitest test for AccountMaintenancePage CRUD flow. Code inspection of `src/features/accounts/AccountMaintenancePage.tsx` confirms:
- Company selector triggers account list load via `useEffect` 
- Account row click calls `selectAccount()` which calls `reset()` + loads balances
- Save button calls PUT via `apiClient.PUT` on `/accounts/{id}`
- New button calls `startNew()` which calls `reset()` with blank defaults

No defect identified from code inspection. Basic save flow is structurally correct.

## Risk
MEDIUM — account CRUD is a real feature; PUT/POST paths are untested.
