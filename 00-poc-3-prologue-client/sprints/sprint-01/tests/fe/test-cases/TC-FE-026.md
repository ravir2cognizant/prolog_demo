---
id: TC-FE-026
rc-ref: RC-017
type: e2e
priority: P1
automated: yes
---

# TC-FE-026 -- E2E: Account Maintenance Create New Account End-to-End

## Test Objective
Full end-to-end Playwright test: user navigates to Account Maintenance, selects a company, clicks New, fills in account details, and saves.

## Preconditions
- App running at http://localhost:5173
- MSW browser worker active with fixture data

## Test Steps
1. Navigate to http://localhost:5173/accounts
2. Select company from the dropdown
3. Assert the account list panel loads
4. Click "New" button
5. Fill in Code "1-001-0001-000-00", Description "Test Account", Type "asset", Active checked
6. Click Save
7. Assert no error toast
8. Assert the new account appears in the account list (or a success indicator is shown)

## Expected Results
- New account form accessible via New button
- Save calls POST /accounts
- Success feedback visible

## Coverage Notes
Covers RC-017 AC-2 (new account saved and appears in picker), FR-2 (create with required fields). E2E happy path for account maintenance.
