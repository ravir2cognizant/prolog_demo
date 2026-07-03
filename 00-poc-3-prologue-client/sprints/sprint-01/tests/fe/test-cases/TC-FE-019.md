---
id: TC-FE-019
rc-ref: RC-017
type: unit
priority: P1
automated: yes
---

# TC-FE-019 -- Account Maintenance: Company Change Resets Form State

## Test Objective
Verify that changing the company selector in AccountMaintenancePage clears any previously selected account and resets the form fields, preventing stale data from a previous company's account from being shown (CR-004 recommended fix).

## Preconditions
- `apiClient.GET` mocked for companies and accounts
- An account is loaded from company "c1" before changing to company "c2"

## Test Steps
1. Render AccountMaintenancePage, select company "c1"
2. Await accounts list, click on account "acct-1" to load it into the form
3. Assert form shows Code "1-394-7005-008-96"
4. Change company selector to "c2"
5. Assert the form Code field is now empty
6. Assert the account list panel shows no selected account (or loading state for c2)

## Expected Results
- After company change, form is cleared (no stale values from previous company)
- Account list reloads for the new company

## Coverage Notes
Addresses RC-017 AC-1 (search shows filtered list per company). Also tests CR-004 recommended fix (reset() call on company change).
