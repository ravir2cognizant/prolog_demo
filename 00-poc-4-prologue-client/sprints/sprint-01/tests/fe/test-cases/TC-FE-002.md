---
id: TC-FE-002
rc-ref: RC-001
ci-ref: CI-001
type: unit
priority: P2
automated: yes
---

# TC-FE-002 — Nav Item Alert Dot Displays on Alerted Items

## Scenario
A menu item with `alertState: "dot"` shows a visible alert indicator; items with `alertState: "none"` do not.

## Preconditions
- Two nav items: one with `alertState: "dot"`, one with `alertState: "none"`

## Steps
1. Render `<AppSidebar navItems={mixedAlertItems} currentRoute="/" />`
2. Find the item with `alertState: "dot"` in the DOM
3. Assert it contains a `.nav-alert-dot` element
4. Find the item with `alertState: "none"`
5. Assert it does NOT contain a `.nav-alert-dot` element

## Expected Result
- Alerted item: `.nav-alert-dot` child element is present
- Non-alerted item: no `.nav-alert-dot` child

## Test Data
```ts
const mixedAlertItems = [
  { id: 'a1', label: 'Journal Entry Financial & Statistical', route: '/je', level: 0, alertState: 'dot', enabled: true },
  { id: 'a2', label: 'GL Control', route: '/gl-control', level: 1, parentId: 'a1', alertState: 'none', enabled: true },
]
```
