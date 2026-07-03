---
id: TC-FE-016
rc-ref: RC-015
type: unit
priority: P3
automated: yes
---

# TC-FE-016 -- Accounting Period Control Stub Page Renders

## Test Objective
Verify the Accounting Period Control (open/close) page stub renders for RC-015.

## Preconditions
- React Router MemoryRouter at path `/period-control`

## Test Steps
1. Render PeriodControlPage stub
2. Assert heading contains "Period" or i18n key `periodControl.title`
3. Assert no JS errors

## Expected Results
- Page renders without error

## Coverage Notes
RC-015 (Accounting Period Control). Stub route. Full implementation is post-sprint-01.
