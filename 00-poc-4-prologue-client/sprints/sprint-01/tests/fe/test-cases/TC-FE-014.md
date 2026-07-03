---
id: TC-FE-014
rc-ref: RC-004
ci-ref: CI-004
type: unit
priority: P1
automated: yes
---

# TC-FE-014 — Account Lookup Auto-Populates Account Description

## Scenario
When the user enters a valid account code and moves focus away from the AccountCodeInput, the AccountDescription field is auto-populated with the lookup result.

## Preconditions
- MSW handler: `GET /accounts/US-01-1000-100-01 → 200 { accountCode: 'US-01-1000-100-01', accountDescription: 'Cash - US Operations', isValid: true }`

## Steps
1. Render `<LineItemsGrid journalId={1} lines={[]} onLinesChange={mockFn} />`
2. Type "US-01-1000-100-01" into the AccountCodeInput of the first row
3. Blur the AccountCodeInput (Tab or click away)
4. Assert GET /accounts/US-01-1000-100-01 was called
5. Assert AccountDescription field of that row now shows "Cash - US Operations"

## Expected Result
- Account description populated automatically on blur
- No manual entry required for account description

## Test Data
- MSW mock as above
- Account code: "US-01-1000-100-01"
- Expected description: "Cash - US Operations"
