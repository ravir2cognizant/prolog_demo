---
id: TC-FE-010
rc-ref: RC-009
type: unit
priority: P3
automated: yes
---

# TC-FE-010 -- Allocation Method Stub Page Renders

## Test Objective
Verify that the Allocation Method page stub renders the expected "Coming Soon" placeholder for RC-009 (Allocation Method configuration), indicating the route is wired and the component loads without error.

## Preconditions
- React Router MemoryRouter at path `/allocation-methods`
- No API calls expected

## Test Steps
1. Render the AllocationMethodsPage stub at `/allocation-methods`
2. Assert the page heading or title contains "Allocation" (or the i18n key `allocationMethods.title`)
3. Assert no JS errors are thrown

## Expected Results
- Page renders with correct title
- "Coming Soon" or equivalent placeholder message visible

## Coverage Notes
Covers RC-009 (Allocation Method configuration) UI stub route. Route is wired in routes.tsx; full implementation is out of sprint-01 scope.
