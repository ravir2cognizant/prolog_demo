---
id: DEF-FE-001
test-case: TC-FE-019
owner: A-04
severity: low
location: app/frontend/src/features/accounts/AccountMaintenancePage.tsx:onChange handler (company select)
reporter: "A-07"
date: 2026-05-21
status: open
---

# DEF-FE-001 -- Missing reset() on Company Selector Change in AccountMaintenancePage

## Description
When the user changes the company selector in AccountMaintenancePage, the `onChange` handler calls `setCompanyId(e.target.value); setSelectedId(null); setIsNew(false)` but does **not** call `reset()` on the react-hook-form instance.

If an account was previously loaded into the form and the user changes company, the RHF fields (`code`, `description`, `type`, `active`) retain stale values from the previously selected account.

The form panel hides (`"No records found."`) when `selectedId = null`, so stale values are not visible to the user. However:
- `isDirty` will be `true` spuriously (form thinks it has unsaved changes)
- If the user navigates back to the previously selected account (e.g. same account exists in both companies), the form re-registers with dirty state

## Cross-Reference
This defect was pre-identified in T-006 Code Review as CR-004 (severity LOW). It is carried forward here as a test-discovered confirmation.

## Recommended Fix
```typescript
onChange={(e) => {
  const next = e.target.value;
  setCompanyId(next);
  setSelectedId(null);
  setIsNew(false);
  reset({ companyId: next, code: '', description: '', type: 'asset', active: true });
}}
```

## Rework Required
NO — LOW severity, no functional regression, rework at A-04's discretion.
