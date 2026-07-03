---
id: TC-FE-033
rc-ref: RC-008
ci-ref: CI-008
type: integration
priority: P1
automated: yes
---

# TC-FE-033 — Company List Populates Within 500ms of Form Load

## Scenario
The company dropdown populates with company data within 500ms of the form rendering (RC-008 NFR).

## Preconditions
- MSW handler: `GET /reference/companies → 200 [...]` with ≤ 450ms simulated delay

## Steps
1. Record `t0 = performance.now()` before rendering form
2. Render JournalEntryForm in create mode with MSW active
3. Wait for CompanyIdSelect to show at least one option (not just "Loading...")
4. Record `t1 = performance.now()`
5. Assert `(t1 - t0) < 500`
6. Assert dropdown has 2+ options (multi-company per RC-008 FR-5)

## Expected Result
- Company list populated in < 500ms
- At least 2 company options present

## Test Data
- MSW mock with 400ms delay returning 3 companies
