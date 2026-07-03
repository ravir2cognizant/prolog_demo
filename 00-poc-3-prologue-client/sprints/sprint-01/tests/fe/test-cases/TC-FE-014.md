---
id: TC-FE-014
rc-ref: RC-013
type: unit
priority: P3
automated: yes
---

# TC-FE-014 -- Currency Maintenance Stub Page Renders

## Test Objective
Verify the Currency Maintenance page stub renders for RC-013.

## Preconditions
- React Router MemoryRouter at path `/currencies`

## Test Steps
1. Render CurrenciesPage stub
2. Assert heading contains "Currenc" or i18n key `currencies.title`
3. Assert no JS errors

## Expected Results
- Page renders without error

## Coverage Notes
RC-013 (Currency configuration). Stub route.
