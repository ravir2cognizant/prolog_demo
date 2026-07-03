---
id: TC-FE-017
rc-ref: RC-004
ci-ref: CI-004
type: integration
priority: P1
automated: yes
---

# TC-FE-017 — Account Lookup Responds Within 500ms

## Scenario
The account description lookup completes and populates the AccountDescription field within 500ms of account code entry (RC-004 NFR).

## Preconditions
- MSW handler with 0ms delay (simulating fast BFF): `GET /accounts/US-01-1000-100-01 → 200`
- Performance measurement via `performance.now()`

## Steps
1. Render LineItemsGrid with MSW active
2. Record `t0 = performance.now()` before entering account code
3. Type "US-01-1000-100-01" into AccountCodeInput
4. Blur the field
5. Wait for AccountDescription to be populated
6. Record `t1 = performance.now()`
7. Assert `(t1 - t0) < 500`

## Expected Result
- AccountDescription populated in < 500ms
- Test passes with a simulated BFF response at ≤ 450ms to allow UI rendering overhead

## Test Data
- MSW handler with configurable delay (set to 400ms for boundary test)
