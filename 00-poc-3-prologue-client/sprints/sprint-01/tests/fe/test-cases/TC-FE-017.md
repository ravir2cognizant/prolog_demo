---
id: TC-FE-017
rc-ref: RC-016
type: unit
priority: P3
automated: yes
---

# TC-FE-017 -- Routing Rules Stub Page Renders

## Test Objective
Verify the Routing Rules administration page stub renders for RC-016.

## Preconditions
- React Router MemoryRouter at path `/routing-rules`

## Test Steps
1. Render RoutingRulesPage stub
2. Assert heading contains "Routing" or i18n key `routingRules.title`
3. Assert no JS errors

## Expected Results
- Page renders without error

## Coverage Notes
RC-016 (GL Control / Routing Administration). Stub route.
