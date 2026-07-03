---
id: TC-FE-021
rc-ref: RC-017
type: a11y
priority: P2
automated: yes
---

# TC-FE-021 -- AccountMaintenancePage Accessibility: Labels and Focus

## Test Objective
Verify that AccountMaintenancePage has no critical accessibility violations, all form fields have labels, and the search input is keyboard-accessible.

## Preconditions
- Playwright browser environment
- App running at http://localhost:5173
- Navigate to /accounts

## Test Steps
1. Navigate to /accounts
2. Run axe-core scan
3. Assert 0 critical/serious violations
4. Assert the search input has a label or aria-label
5. Assert the account list items are focusable or navigable via keyboard
6. Assert form fields (Code, Description, Type, Active checkbox) all have labels

## Expected Results
- axe-core: 0 critical/serious violations
- All fields labelled
- Search input keyboard accessible

## Coverage Notes
Covers RC-017 NFR Accessibility ("account search field must be labelled and keyboard-accessible").
