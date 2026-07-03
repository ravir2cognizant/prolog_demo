---
id: TC-FE-032
rc-ref: RC-008
ci-ref: CI-008
type: unit
priority: P1
automated: yes
---

# TC-FE-032 — CompanyIdSelect Disabled in Edit Mode

## Scenario
CompanyIdSelect renders as disabled when the `disabled` prop is true (edit mode), preventing company change after initial save (OQ-004b conservative default).

## Preconditions
- CompanyIdSelect component

## Steps
### Edit mode (disabled):
1. Render `<CompanyIdSelect companies={mockCompanies} value="0004" onChange={mockFn} disabled={true} />`
2. Assert the select element has `disabled` attribute
3. Assert the currently selected value still displays ("0004 - 0004_company")

### Create mode (enabled):
4. Render with `disabled={false}`
5. Assert select element does NOT have `disabled` attribute
6. Change selection to "0005 - Alpha Corp"
7. Assert `mockFn` was called with "0005"

## Expected Result
- disabled=true: select is disabled; current value displays
- disabled=false: select is active; onChange fires on selection

## Test Data
```ts
const mockCompanies = [{ companyId: '0004', companyName: '0004_company' }, { companyId: '0005', companyName: 'Alpha Corp' }]
```
