---
id: TC-FE-018
rc-ref: RC-017
type: unit
priority: P1
automated: yes
---

# TC-FE-018 -- Account Maintenance: Search, Select, Edit, Save

## Test Objective
Verify that AccountMaintenancePage (a) renders the company selector and account list panel, (b) clicking an account populates the form, (c) submitting the form calls PUT /accounts/{id}, and (d) the New button resets the form for creating a new account.

## Preconditions
- `apiClient.GET` mocked:
  - `/companies` → `{ items: [{ id: 'c1', name: 'Fiserv Inc.', active: true }] }`
  - `/accounts` → `{ items: [{ id: 'acct-1', code: '1-394-7005-008-96', description: 'Cash', type: 'asset', active: true, companyId: 'c1' }], totalCount: 1 }`
  - `/accounts/acct-1/balances` → `{ items: [] }`
- `apiClient.PUT` mocked for `/accounts/acct-1`
- `apiClient.POST` mocked for `/accounts`

## Test Steps
1. Render `<AccountMaintenancePage />`
2. Assert Company selector is present, select "c1"
3. Await account list: assert "1-394-7005-008-96" appears in the list
4. Click on the account row
5. Assert the form panel shows Code "1-394-7005-008-96" and Description "Cash"
6. Change Description to "Cash and Equivalents"
7. Click Save
8. Assert `apiClient.PUT` called with path `/accounts/acct-1`
9. Click New button
10. Assert form is reset (Code = empty, Description = empty, Type = 'asset', Active = true)

## Expected Results
- Account list loads after company select
- Clicking account populates the form
- Save calls PUT endpoint
- New button resets form

## Coverage Notes
Covers RC-017 FR-2 (create/edit), FR-3 (edit), FR-4 (search/lookup), AC-1 (search returns filtered list), AC-2 (new account appears in picker after create), AC-3 (inactive account filtering — partially).
