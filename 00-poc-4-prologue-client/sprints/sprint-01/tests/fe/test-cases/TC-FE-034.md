---
id: TC-FE-034
rc-ref: RC-008
ci-ref: CI-008
type: a11y
priority: P1
automated: yes
---

# TC-FE-034 — Company Dropdown Is Keyboard-Accessible and Labeled "Company ID"

## Scenario
The CompanyIdSelect is keyboard-operable and has an accessible label "Company ID" so screen readers identify it correctly.

## Preconditions
- CompanyIdSelect rendered with companies list and disabled=false

## Steps
1. Render CompanyIdSelect in form context
2. Assert the select element has an associated `<label>` with text "Company ID" (or `aria-label="Company ID"`)
3. Tab to the select element from a previous field
4. Use Arrow Down to navigate options
5. Press Enter to confirm selection
6. Assert `onChange` was called with selected companyId
7. Run axe-core on the select+label; assert zero violations

## Expected Result
- Label "Company ID" programmatically associated with select
- Keyboard selection works (Tab to reach; Arrow Down/Enter to select)
- Zero axe-core violations

## Test Data
- 3 companies; select in enabled state
