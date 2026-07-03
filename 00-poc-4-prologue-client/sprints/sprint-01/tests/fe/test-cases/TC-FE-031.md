---
id: TC-FE-031
rc-ref: RC-008
ci-ref: CI-008
type: unit
priority: P1
automated: yes
---

# TC-FE-031 — Company Dropdown Option Format Is "{companyId} - {companyName}"

## Scenario
Each option in the CompanyIdSelect dropdown displays in the exact format "{companyId} - {companyName}" as specified in RC-008 AC-3.

## Preconditions
- CompanyIdSelect rendered with a list of companies

## Steps
1. Render `<CompanyIdSelect companies={mockCompanies} value="" onChange={mockFn} disabled={false} />`
2. Open the dropdown
3. Assert first option text is exactly "0004 - 0004_company"
4. Assert second option text is exactly "0005 - Alpha Corp"
5. Assert no option omits either the code or the name

## Expected Result
- Each option: `{companyId} - {companyName}` format, no variation

## Test Data
```ts
const mockCompanies = [
  { companyId: '0004', companyName: '0004_company' },
  { companyId: '0005', companyName: 'Alpha Corp' },
]
```
