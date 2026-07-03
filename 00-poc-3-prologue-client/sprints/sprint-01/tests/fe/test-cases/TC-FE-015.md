---
id: TC-FE-015
rc-ref: RC-014
type: unit
priority: P3
automated: yes
---

# TC-FE-015 -- Fiscal Year / Period Stub Page Renders

## Test Objective
Verify the Fiscal Year / Accounting Period page stub renders for RC-014.

## Preconditions
- React Router MemoryRouter at path `/fiscal-years`

## Test Steps
1. Render FiscalYearsPage stub
2. Assert heading contains "Fiscal" or "Period" or i18n key `fiscalYears.title`
3. Assert no JS errors

## Expected Results
- Page renders without error

## Coverage Notes
RC-014 (Fiscal Year configuration). Stub route.
