---
id: TC-FE-013
rc-ref: RC-012
type: unit
priority: P3
automated: yes
---

# TC-FE-013 -- Company Maintenance Stub Page Renders

## Test Objective
Verify the Company Maintenance page stub renders for RC-012.

## Preconditions
- React Router MemoryRouter at path `/companies`

## Test Steps
1. Render CompaniesPage stub
2. Assert heading contains "Compan" (or i18n key `companies.title`)
3. Assert no JS errors

## Expected Results
- Page renders without error

## Coverage Notes
RC-012 (Company Maintenance). Stub route.
