---
id: TC-FE-030
rc-ref: RC-017
type: visual
priority: P3
automated: no
---

# TC-FE-030 -- Visual Regression: AccountMaintenancePage Layout

## Test Objective
Capture and compare a visual snapshot of the AccountMaintenancePage — company selector, account list panel (left), and form panel (right) — to detect layout regressions.

## Preconditions
- Playwright visual regression setup
- App running at http://localhost:5173/accounts
- MSW worker serving 3 accounts for a mocked company

## Test Steps
1. Navigate to /accounts
2. Select the first company from the mock list
3. Await account list to render (3 rows)
4. Click the first account to load it into the form
5. Take full-page screenshot
6. Compare against baseline

## Expected Results
- Two-panel layout (list left, form right) matches baseline
- No overflow or missing field labels

## Coverage Notes
Visual regression baseline for RC-017 (Account Maintenance form). Manual baseline establishment required on first run.
