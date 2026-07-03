---
id: TR-FE-019
tc-ref: TC-FE-019
verdict: DEFECT
executed-by: A-07
date: 2026-05-21
runner: vitest
defect-ref: DEF-FE-001
---

# TR-FE-019 -- Account Maintenance: Company Change Resets Form State

## Verdict: DEFECT

## Defect
**DEF-FE-001** — missing `reset()` call when company selector changes in AccountMaintenancePage.

The `onChange` handler for the company selector calls:
```typescript
onChange={(e) => { setCompanyId(e.target.value); setSelectedId(null); setIsNew(false); }}
```

It does NOT call `reset(...)` to clear the react-hook-form field values. If an account was loaded in the form before the company change, the RHF fields retain stale values. The form panel renders as hidden (`"No records found."`), so stale values are not visible, but `isDirty` may be `true` spuriously.

This is the CR-004 finding from T-006, carried forward as a test-discovered defect.

## Severity
LOW — visual impact is minimal (stale fields hidden). `isDirty` warnings possible.

## See Also
DEF-FE-001.md
