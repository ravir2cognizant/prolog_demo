---
id: TC-FE-004
rc-ref: RC-001
ci-ref: CI-001
type: a11y
priority: P1
automated: yes
---

# TC-FE-004 — Nav Menu Keyboard Navigation and Screen Reader Accessibility

## Scenario
The navigation menu is fully keyboard-operable; the active menu item is announced by screen readers.

## Preconditions
- AppSidebar rendered with standard nav items; "Journal Entry Financial & Statistical" is active

## Steps
1. Focus the first nav item via keyboard (Tab)
2. Use Arrow Down to traverse nav items
3. Press Enter on a collapsed section — verify sub-items expand
4. Press Escape or Arrow Up to collapse
5. Run axe-core accessibility scan on the nav element
6. Verify active item has `aria-current="page"` attribute

## Expected Result
- All nav items are Tab/Arrow reachable
- Enter expands sections; Escape or Arrow collapses
- axe-core reports zero accessibility violations on the nav
- Active item has `aria-current="page"` so screen readers announce it
- Nav has `role="navigation"` or `<nav>` element with accessible label

## Test Data
- Standard mock nav items (same as TC-FE-001)
